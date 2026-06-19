import 'reflect-metadata';
import { postGroup } from './controller';
import { GroupEntity } from '@entities/group.entity';
import { SettingEntity } from '@entities/setting.entity';
import { getPalmettoDBConnection } from '@db/index';
import { generateGroupJSONFile } from './syncGroupJSON';

jest.mock('@db/index', () => ({
  getPalmettoDBConnection: jest.fn(),
}));

// Stub the S3 sync so postGroup does not reach out to S3/SSM during the test.
jest.mock('./syncGroupJSON', () => ({
  generateGroupJSONFile: jest.fn(),
}));

// pvGroupID 1 holds the SCEMD default basemapID setting (see controller.postGroup).
const SCEMD_GROUP_ID = 1;

type GroupRepoMock = {
  findOneOrFail: jest.Mock;
  save: jest.Mock;
};

type SettingRepoMock = {
  findOne: jest.Mock;
  save: jest.Mock;
};

describe('postGroup basemapID persistence', () => {
  let groupRepo: GroupRepoMock;
  let settingRepo: SettingRepoMock;

  beforeEach(() => {
    jest.clearAllMocks();
    (generateGroupJSONFile as jest.Mock).mockResolvedValue(undefined);

    groupRepo = {
      findOneOrFail: jest.fn(),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    settingRepo = {
      findOne: jest.fn(),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };

    (getPalmettoDBConnection as jest.Mock).mockResolvedValue({
      getRepository: jest.fn((entity: unknown) => {
        if (entity === SettingEntity) return settingRepo;
        if (entity === GroupEntity) return groupRepo;
        throw new Error('Unexpected repository requested');
      }),
    });
  });

  it('creates a basemapID setting row when updating a group that has none (reported bug: group 228)', async () => {
    groupRepo.findOneOrFail.mockResolvedValue({
      pvGroupID: 228,
      pvGroupName: 'old',
      pvGroupTitle: 'old',
      pvGroupComment: 'old',
      pvIsAgency: 0,
    });

    // SCEMD default row exists; the target group (228) has no basemapID row yet.
    settingRepo.findOne.mockImplementation(({ where }: { where: { pvGroupID: number } }) =>
      Promise.resolve(
        where.pvGroupID === SCEMD_GROUP_ID ? { pvSettingValue: 'scemd-default-value-0000000000000000' } : null,
      ),
    );

    await postGroup({
      pvGroupID: 228,
      pvGroupName: 'DES',
      pvGroupTitle: 'Department of Environmental Services',
      pvGroupComment: 'Department of Environmental Services',
      pvIsAgency: 1,
      basemapID: '1224',
    });

    expect(settingRepo.save).toHaveBeenCalledTimes(1);
    const saved = settingRepo.save.mock.calls[0][0] as SettingEntity;
    expect(saved.pvSettingType).toBe('basemapID');
    expect(saved.pvGroupID).toBe(228);
    expect(saved.pvSettingValue).toBe('1224');
    expect(saved.pvVoid).toBe(0);
  });

  it('updates the existing basemapID row when one is present (protects current behavior)', async () => {
    groupRepo.findOneOrFail.mockResolvedValue({ pvGroupID: 228 });

    const existingSetting = { pvSettingType: 'basemapID', pvGroupID: 228, pvSettingValue: 'stale', pvVoid: 0 };
    settingRepo.findOne.mockImplementation(({ where }: { where: { pvGroupID: number } }) =>
      Promise.resolve(where.pvGroupID === SCEMD_GROUP_ID ? null : existingSetting),
    );

    await postGroup({
      pvGroupID: 228,
      pvGroupName: 'DES',
      pvGroupTitle: 'Department of Environmental Services',
      pvGroupComment: '',
      pvIsAgency: 1,
      basemapID: '1224',
    });

    expect(settingRepo.save).toHaveBeenCalledTimes(1);
    const saved = settingRepo.save.mock.calls[0][0] as SettingEntity;
    expect(saved.pvSettingValue).toBe('1224');
  });

  it('persists basemapID for a brand-new group (no pvGroupID)', async () => {
    groupRepo.save.mockResolvedValue({ pvGroupID: 999 });
    settingRepo.findOne.mockResolvedValue(null);

    await postGroup({
      pvGroupName: 'New Group',
      pvGroupTitle: 'New Group Title',
      pvGroupComment: '',
      pvIsAgency: 0,
      basemapID: '5678',
    });

    expect(settingRepo.save).toHaveBeenCalledTimes(1);
    const saved = settingRepo.save.mock.calls[0][0] as SettingEntity;
    expect(saved.pvSettingType).toBe('basemapID');
    expect(saved.pvGroupID).toBe(999);
    expect(saved.pvSettingValue).toBe('5678');
    expect(saved.pvVoid).toBe(0);
  });

  it('falls back to the SCEMD default when creating a row for a group with an empty basemapID', async () => {
    const scemdValue = 'scemd-default-value-0000000000000000';
    groupRepo.findOneOrFail.mockResolvedValue({ pvGroupID: 300 });

    // SCEMD default row exists; the target group (300) has no basemapID row yet.
    settingRepo.findOne.mockImplementation(({ where }: { where: { pvGroupID: number } }) =>
      Promise.resolve(where.pvGroupID === SCEMD_GROUP_ID ? { pvSettingValue: scemdValue } : null),
    );

    await postGroup({
      pvGroupID: 300,
      pvGroupName: 'DES',
      pvGroupTitle: 'Department of Environmental Services',
      pvGroupComment: '',
      pvIsAgency: 1,
      basemapID: '',
    });

    expect(settingRepo.save).toHaveBeenCalledTimes(1);
    const saved = settingRepo.save.mock.calls[0][0] as SettingEntity;
    expect(saved.pvGroupID).toBe(300);
    expect(saved.pvSettingValue).toBe(scemdValue);
  });
});
