import { FromSchema } from 'json-schema-to-ts';
import { getPalmettoDBConnection } from '@db/index';
import { GroupEntity } from '@entities/group.entity';
import { Group2ActionEntity } from '@entities/group2action.entity';
import { SettingEntity } from '@entities/setting.entity';
import { GROUPS_COLUMNS as group_columns } from '@libs/columns';
import {
  convertColsToFilterSQL,
  convertColsToOrderSQL,
  convertColumnsToSelectString,
  findWordInBrackets,
} from '@utils/filterSql';
import { GroupSchema, SubGroupSchema } from './schema';

const GROUP_VIEW_NAME = 'group_view';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getGroupAll = async (payload: any) => {
  try {
    const db = await getPalmettoDBConnection();
    // eslint-disable-next-line prefer-const
    let { offset, limit, parentID, ...otherParams } = payload;
    const otherParamsKeys: string[] = [];

    for (const key in otherParams) {
      if (Object.prototype.hasOwnProperty.call(otherParams, key)) {
        otherParamsKeys.push(JSON.parse(JSON.stringify(key)));
      }
    }
    const idxOfOrder = otherParamsKeys.findIndex((element) => element.includes('orders'));
    if (idxOfOrder !== -1) {
      const orderKey = otherParamsKeys[idxOfOrder];
      const sortBy = findWordInBrackets(orderKey);
      const sort = payload[`orders[${sortBy}]`][0];
      otherParams.orders = { [sortBy]: sort };
    }

    const filters = { search: payload['filters[search]'] };
    const hasFilters: boolean = Object.prototype.hasOwnProperty.call(payload, 'filters[search]');

    limit = Number(limit || 3000);
    offset = Number(offset || 0);
    let count: number | undefined = undefined;
    let sql: string;
    let sqlCount: string;

    const SelectString = convertColumnsToSelectString(group_columns);
    sql = `${SelectString} FROM ${GROUP_VIEW_NAME} a WHERE (a.pvVoid = 0 OR a.pvVoid IS NULL) `;
    sqlCount = `SELECT COUNT(*) as size
                FROM ${GROUP_VIEW_NAME} a
                WHERE (a.pvVoid = 0 OR a.pvVoid IS NULL) `;

    if (parentID && Number(parentID) > 0) {
      sql += ` AND a.pvParentGroupID = ${Number(parentID)}`;
      sqlCount += ` AND a.pvParentGroupID = ${Number(parentID)}`;
    } else {
      sql += ` AND a.pvParentGroupID IS NULL`;
      sqlCount += ` AND a.pvParentGroupID IS NULL`;
    }

    if (hasFilters) {
      sql += ` AND ${convertColsToFilterSQL(filters, Object.keys(group_columns), 'a')} `;
      sqlCount += ` AND ${convertColsToFilterSQL(filters, Object.keys(group_columns), 'a')} `;
    }

    if (otherParams && otherParams.orders) {
      sql += ` ${convertColsToOrderSQL(otherParams.orders, 'a')} `;
      sqlCount += ` ${convertColsToOrderSQL(otherParams.orders, 'a')} `;
    } else {
      sql += ` ORDER BY a.pvGroupID `;
      sqlCount += ` ORDER BY a.pvGroupID `;
    }

    if (offset === 0) {
      const countResult = await db.query(sqlCount);
      if (countResult && countResult.records) {
        count = countResult[0].size;
      }
    }
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    const results: GroupEntity[] = await db.query(sql);
    return {
      count,
      dataset: results,
    };
  } catch (error) {
    let message: string;
    message = 'Internal Server Error';
    if (error instanceof Error) message = error.message;
    throw { message };
  }
};

export const getGroupByID = async (groupID: number) => {
  try {
    const db = await getPalmettoDBConnection();

    // First, get the group data
    const groupEntityRepo = db.getRepository(GroupEntity);
    const group = await groupEntityRepo.findOne({ where: { pvGroupID: groupID, pvVoid: 0 } });

    if (!group) return Promise.reject(new Error('Group not found!'));
    const groupRecord = { ...group, basemapID: '' };

    // Get BaseMap ID
    const settingRepo = db.getRepository(SettingEntity);
    const settingRecord = await settingRepo.findOne({ where: { pvSettingType: 'basemapID', pvGroupID: groupID } });
    if (settingRecord) groupRecord.basemapID = settingRecord.pvSettingValue;
    // Second, get the contacts for this group
    const contacts = await db.query(
      `SELECT *
         FROM group_contact_view
         WHERE (pvVoid = 0 OR pvVoid IS NULL)
           AND pvContactGroupID = ?`,
      [groupID],
    );

    // Third, get the subgroups for this group
    const subgroups = await groupEntityRepo.find({ where: { pvParentGroupID: groupID, pvVoid: 0 } });

    // Fourth, get the applications for this group
    const g2ActionRepo = db.getRepository(Group2ActionEntity);
    const appServices = await g2ActionRepo
      .createQueryBuilder('group2action')
      .where('pvGroupID = :groupID', { groupID })
      .andWhere('pvVoid = 0')
      .getMany();

    // Combine into the desired structure
    return {
      ...groupRecord,
      contacts: contacts || [],
      subgroups: subgroups || [],
      appServices: appServices || [],
    };
  } catch (error) {
    let message = 'Internal Server Error';
    if (error instanceof Error) message = error.message;
    throw { message };
  }
};

export const postGroup = async (payload: FromSchema<typeof GroupSchema>) => {
  try {
    const db = await getPalmettoDBConnection();
    const groupRepo = db.getRepository(GroupEntity);
    if (payload.pvGroupID) {
      //  *: Find if Group exists
      const groupInfo = await groupRepo.findOneOrFail({ where: { pvGroupID: Number(payload.pvGroupID) } });
      groupInfo.pvGroupName = payload.pvGroupName;
      groupInfo.pvGroupTitle = payload.pvGroupTitle;
      groupInfo.pvGroupComment = payload.pvGroupComment;
      groupInfo.pvIsAgency = payload.pvIsAgency;
      if (payload.basemapID && payload.basemapID.length) {
        const settingRepo = db.getRepository(SettingEntity);
        const settingRecord = await settingRepo.findOne({
          where: {
            pvVoid: 0,
            pvSettingType: 'basemapID',
            pvGroupID: payload.pvGroupID,
          },
        });
        if (settingRecord) {
          settingRecord.pvSettingValue = payload.basemapID;
          await settingRepo.save(settingRecord);
        }
      }
      return await groupRepo.save(groupInfo);
    } else {
      const newRecord = new GroupEntity();
      newRecord.pvGroupName = payload.pvGroupName;
      newRecord.pvGroupTitle = payload.pvGroupTitle;
      newRecord.pvGroupComment = payload.pvGroupComment;
      newRecord.pvIsAgency = payload.pvIsAgency;
      newRecord.pvVoid = 0;
      newRecord.pvDomainID = 0;
      return await groupRepo.save(newRecord);
    }
  } catch (error) {
    let message = 'Internal Server Error';
    if (error instanceof Error) message = error.message;
    throw { message };
  }
};

export const postSubGroups = async (payload: FromSchema<typeof SubGroupSchema>) => {
  try {
    const db = await getPalmettoDBConnection();
    const groupRepo = db.getRepository(GroupEntity);
    const subgroups = payload.subgroups;

    if (subgroups && subgroups.length) {
      for (let i = 0; i < subgroups.length; i++) {
        const subGroup = subgroups[i];
        if (subGroup.isNew) {
          const newGroup = new GroupEntity();
          newGroup.pvGroupName = subGroup.pvGroupName;
          newGroup.pvGroupTitle = subGroup.pvGroupTitle;
          newGroup.pvGroupComment = subGroup.pvGroupComment;
          newGroup.pvIsAgency = subGroup.pvIsAgency;
          newGroup.pvVoid = 0;
          newGroup.pvDomainID = 0;
          newGroup.pvParentGroupID = subGroup.pvParentGroupID;
          await groupRepo.save(newGroup);
        }
      }
      const toRemoveGroupIDs = subgroups.filter((group) => group.deleted).map((group) => group.pvGroupID);
      if (toRemoveGroupIDs.length) {
        await groupRepo
          .createQueryBuilder()
          .update(GroupEntity)
          .set({ pvVoid: 1 })
          .where('pvGroupID IN (:...toRemoveGroupIDs)', { toRemoveGroupIDs })
          .execute();
      }
    }
    return { message: 'Subgroups updated successfully' };
  } catch (error) {
    let message = 'Internal Server Error';
    if (error instanceof Error) message = error.message;
    throw { message };
  }
};

export const deleteGroup = async (groupID: number) => {
  try {
    const db = await getPalmettoDBConnection();
    const groupRepo = db.getRepository(GroupEntity);
    const group = await groupRepo.findOneOrFail({ where: { pvGroupID: groupID } });
    group.pvVoid = 1;
    return await groupRepo.save(group);
  } catch (error) {
    let message = 'Internal Server Error';
    if (error instanceof Error) message = error.message;
    throw { message };
  }
};
