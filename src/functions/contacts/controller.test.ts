import 'reflect-metadata';
import { getGroupContactsByGroupId, postContactsToGroup } from './controller';
import { getPalmettoDBConnection } from '@db/index';
import { GroupContactEntity } from '@entities/group_contact.entity';

jest.mock('@db/index', () => ({
  getPalmettoDBConnection: jest.fn(),
}));

describe('getGroupContactsByGroupId', () => {
  let query: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    query = jest.fn().mockResolvedValue([]);
    (getPalmettoDBConnection as jest.Mock).mockResolvedValue({ query });
  });

  it('filters on the account-level void flag, not only the account2group membership flag (reported bug: voided accounts still selectable as contacts)', async () => {
    await getGroupContactsByGroupId(42);

    const [sql] = query.mock.calls[0];
    expect(sql).toMatch(/join\s+account\s+\w+\s+on/i);
    expect(sql).toMatch(/\ba\.pvVoid\s*=\s*0\b/i);
  });

  it('uses NOT EXISTS instead of NOT IN for the already-a-contact check (NOT IN is NULL-unsafe against nullable pvAccountID)', async () => {
    await getGroupContactsByGroupId(42);

    const [sql] = query.mock.calls[0];
    expect(sql.toUpperCase()).not.toMatch(/NOT IN/);
    expect(sql.toUpperCase()).toMatch(/NOT EXISTS/);
  });

  it('checks pvContactAccountID (not pvAccountID) for the already-a-contact exclusion (reported bug: a group_contact row whose pvAccountID diverges from pvContactAccountID -- e.g. a legacy row -- made an unrelated account look like an existing contact and silently blocked them from being added)', async () => {
    await getGroupContactsByGroupId(42);

    const [sql] = query.mock.calls[0];
    const existsClause = sql.match(/NOT EXISTS\s*\(([\s\S]*)\)/i)?.[1] ?? '';
    expect(existsClause).toMatch(/pvContactAccountID\s*=\s*ag\.pvAccountID/i);
    expect(existsClause).not.toMatch(/(?<!Contact)pvAccountID\s*=\s*ag\.pvAccountID/i);
  });

  it('passes groupId as both query parameters', async () => {
    await getGroupContactsByGroupId(42);

    const [, params] = query.mock.calls[0];
    expect(params).toEqual([42, 42]);
  });

  it('normalizes a thrown error to a message-only object', async () => {
    query.mockRejectedValue(new Error('connection reset'));

    await expect(getGroupContactsByGroupId(42)).rejects.toEqual({ message: 'connection reset' });
  });
});

describe('postContactsToGroup', () => {
  let save: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    save = jest.fn().mockResolvedValue([]);
    (getPalmettoDBConnection as jest.Mock).mockResolvedValue({
      getRepository: jest.fn(() => ({ save, createQueryBuilder: jest.fn() })),
    });
  });

  it('writes pvContactAccountID/pvContactGroupID equal to pvAccountID/pvGroupID on insert (regression guard: a mismatch here is what let group_contact rows silently misrepresent who a contact is and broke the already-a-contact check -- see the fixed test above)', async () => {
    await postContactsToGroup({
      contacts: [{ pvAccountID: 555, pvGroupID: 40, isNew: true }],
      deleted: [],
    });

    expect(save).toHaveBeenCalledTimes(1);
    const [saved]: GroupContactEntity[] = save.mock.calls[0][0];
    expect(saved.pvContactAccountID).toBe(saved.pvAccountID);
    expect(saved.pvContactGroupID).toBe(saved.pvGroupID);
  });

  it('keeps the invariant for every row when adding multiple contacts at once', async () => {
    await postContactsToGroup({
      contacts: [
        { pvAccountID: 555, pvGroupID: 40, isNew: true },
        { pvAccountID: 556, pvGroupID: 40, isNew: true },
      ],
      deleted: [],
    });

    const saved: GroupContactEntity[] = save.mock.calls[0][0];
    expect(saved).toHaveLength(2);
    saved.forEach((contact) => {
      expect(contact.pvContactAccountID).toBe(contact.pvAccountID);
      expect(contact.pvContactGroupID).toBe(contact.pvGroupID);
    });
  });
});
