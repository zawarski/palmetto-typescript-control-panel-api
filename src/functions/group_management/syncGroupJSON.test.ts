import { generateGroupJSONFile } from './syncGroupJSON';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn(),
}));

jest.mock('aws-param-store', () => ({
  getParameters: jest.fn(),
}));

jest.mock('@db/index', () => ({
  getPalmettoDBConnection: jest.fn(),
}));

const SSM_KEY_ID = '/palmetto-serverless-loopback/all/s3accessKeyId';
const SSM_SECRET = '/palmetto-serverless-loopback/all/s3secretAccessKey';

const syntheticGroups = [
  {
    pvGroupID: 1,
    pvGroupName: 'County A EMA',
    pvGroupTitle: 'County A Emergency Management',
    pvGroupComment: 'Top-level county agency',
    pvVoid: 0,
    pvParentGroupID: null,
    pvIsAgency: 1,
  },
  {
    pvGroupID: 2,
    pvGroupName: 'County A Municipal',
    pvGroupTitle: 'County A Municipal Office',
    pvGroupComment: '',
    pvVoid: 0,
    pvParentGroupID: 1,
    pvIsAgency: 0,
  },
];

describe('generateGroupJSONFile', () => {
  let mockS3Send: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // S3 mock: constructor returns an instance with a send() stub
    mockS3Send = jest.fn().mockResolvedValue({});
    (jest.requireMock('@aws-sdk/client-s3').S3Client as jest.Mock).mockImplementation(() => ({
      send: mockS3Send,
    }));

    // SSM mock: both parameters present and non-empty
    (jest.requireMock('aws-param-store').getParameters as jest.Mock).mockResolvedValue({
      Parameters: [
        { Name: SSM_KEY_ID, Value: 'fake-access-key-id' },
        { Name: SSM_SECRET, Value: 'fake-secret-access-key' },
      ],
    });

    // DB mock: returns a repo whose find() resolves to synthetic groups
    (jest.requireMock('@db/index').getPalmettoDBConnection as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue({
        find: jest.fn().mockResolvedValue(syntheticGroups),
      }),
    });
  });

  it('calls PutObjectCommand with correct Bucket, Key, and JSON body matching DB entities, and logs INFO', async () => {
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);

    await expect(generateGroupJSONFile()).resolves.toBeUndefined();

    // Verify SSM was called with both expected parameter paths
    const { getParameters } = jest.requireMock('aws-param-store');
    expect(getParameters).toHaveBeenCalledWith(
      expect.arrayContaining([SSM_KEY_ID, SSM_SECRET]),
      expect.objectContaining({ region: 'us-east-1' }),
    );

    // Verify PutObjectCommand received correct Bucket, Key, and body
    const { PutObjectCommand } = jest.requireMock('@aws-sdk/client-s3');
    expect(PutObjectCommand).toHaveBeenCalledTimes(1);
    const [cmdInput] = (PutObjectCommand as jest.Mock).mock.calls[0] as [
      { Bucket: string; Key: string; Body: string },
    ];
    expect(cmdInput.Bucket).toBe('palmetto-wab');
    expect(cmdInput.Key).toBe('s3db/groups.json');
    expect(JSON.parse(cmdInput.Body)).toEqual(syntheticGroups);

    // Verify S3 send was called once and INFO was logged with operation name
    expect(mockS3Send).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledTimes(1);
    const logEntry = JSON.parse(infoSpy.mock.calls[0][0] as string) as Record<string, unknown>;
    expect(logEntry).toMatchObject({ operation: 'syncGroupJSON' });

    infoSpy.mockRestore();
  });

  it('resolves without throwing when S3 rejects, calls console.warn with operation context, does not call console.error', async () => {
    mockS3Send.mockRejectedValue(new Error('S3 throttled'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(generateGroupJSONFile()).resolves.toBeUndefined();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    const warnEntry = JSON.parse(warnSpy.mock.calls[0][0] as string) as Record<string, unknown>;
    expect(warnEntry).toMatchObject({ operation: 'syncGroupJSON' });
    expect(warnEntry.error).toBe('S3 throttled');

    expect(errorSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
