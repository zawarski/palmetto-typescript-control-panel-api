import { getPalmettoDBConnection } from '@db/index';

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
