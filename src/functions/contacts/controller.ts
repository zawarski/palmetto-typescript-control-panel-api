import { FromSchema } from 'json-schema-to-ts';
import { getPalmettoDBConnection } from '@db/index';
import { ContactsSchema } from './schema';
import { GroupContactEntity } from '@entities/group_contact.entity';

export const getGroupContactsByGroupId = async (groupId: number) => {
  try {
    const db = await getPalmettoDBConnection();
    const sql = `SELECT *
                 FROM account2group_view
                 WHERE (pvVoid = 0 OR pvVoid IS NULL)
                   AND pvGroupID = ?
                   AND pvAccountID NOT IN
                       (SELECT pvAccountID FROM group_contact_view WHERE pvGroupID = ? AND pvVoid = 0)`;
    return await db.query(sql, [groupId, groupId]);
  } catch (error) {
    let message = 'Internal Server Error';
    if (error instanceof Error) message = error.message;
    throw { message };
  }
};

export const postContactsToGroup = async (payload: FromSchema<typeof ContactsSchema>) => {
  try {
    const db = await getPalmettoDBConnection();
    const contactsRepo = db.getRepository(GroupContactEntity);
    const newGroupContacts = payload.contacts.map((contact) => {
      if (contact.isNew) return contact;
    });

    const today = new Date();
    if (newGroupContacts.length) {
      //   *: Add new contacts to the group
      const newContacts: GroupContactEntity[] = [];
      newGroupContacts.forEach((contact) => {
        const newContact = new GroupContactEntity();
        newContact.pvAccountID = contact.pvAccountID;
        newContact.pvGroupID = contact.pvGroupID;
        newContact.pvContactGroupID = contact.pvGroupID;
        newContact.pvContactAccountID = contact.pvAccountID;
        newContact.pvEntryDate = today;
        newContact.pvVoid = 0;
        newContacts.push(newContact);
      });

      await contactsRepo.save(newContacts);
    }

    //   *: Remove contacts from the group
    if (payload.deleted && payload.deleted.length > 0) {
      const toRemoveContactIDs = payload.deleted.map((id) => parseInt(id));
      await contactsRepo
        .createQueryBuilder()
        .update(GroupContactEntity)
        .set({ pvVoid: 1 })
        .where('pvDataID IN (:...toRemoveContactIDs)', { toRemoveContactIDs })
        .execute();
    }

    return { message: 'Contacts updated to group successfully' };
  } catch (error) {
    let message = 'Internal Server Error';
    if (error instanceof Error) message = error.message;
    throw { message };
  }
};
