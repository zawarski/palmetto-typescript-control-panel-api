import { getPalmettoDBConnection } from '@db/index';
import { GROUPS_COLUMNS as group_columns } from '@libs/columns';
import {
  convertColsToFilterSQL,
  convertColsToOrderSQL,
  convertColumnsToSelectString,
  findWordInBrackets,
} from '@utils/filterSql';

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
    let count = undefined;
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

    const results = await db.query(sql);
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
