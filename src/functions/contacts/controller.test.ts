import 'reflect-metadata';
import { getGroupContactsByGroupId } from './controller';
import { getPalmettoDBConnection } from '@db/index';

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
