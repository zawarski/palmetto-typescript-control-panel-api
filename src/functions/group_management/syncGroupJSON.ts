/*
 * generateGroupJSONFile — syncs group table to S3 after every write.
 *
 * Target flow:
 *
 *   SSM GetParameters (s3 creds, 5 s timeout)
 *        │
 *        ├── validate both params non-empty
 *        │
 *        ├── groupRepo.find({ pvVoid: 0 })
 *        │
 *        └── S3 PutObject palmetto-wab/s3db/groups.json (5 s timeout)
 *               │
 *               ├── success → console.info { operation, groupCount, bytes }
 *               └── failure → console.warn, return  (API still returns success)
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import awsParamStore from 'aws-param-store';
import { IsNull } from 'typeorm';
import { getPalmettoDBConnection } from '@db/index';
import { GroupEntity } from '@entities/group.entity';

const SSM_KEY_ID_PATH = '/palmetto-serverless-loopback/all/s3accessKeyId';
const SSM_SECRET_PATH = '/palmetto-serverless-loopback/all/s3secretAccessKey';
const REGION = 'us-east-1';
const S3_BUCKET = 'palmetto-wab';
const S3_KEY = 's3db/groups.json';
const TIMEOUT_MS = 5_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  const timer = new Promise<T>((_, reject) => {
    timerId = setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms);
  });
  // Clear the timer on settle so no dangling handles remain after the race.
  return Promise.race([promise, timer]).finally(() => clearTimeout(timerId));
}

export const generateGroupJSONFile = async (): Promise<void> => {
  // Step 1: fetch S3 credentials from SSM (fail-fast: if creds missing, skip sync)
  const ssmResult = await withTimeout(
    awsParamStore.getParameters([SSM_KEY_ID_PATH, SSM_SECRET_PATH], { region: REGION, httpOptions: { timeout: TIMEOUT_MS } }),
    TIMEOUT_MS,
  ).catch((err: unknown) => {
    const isTimeout = err instanceof Error && err.message.startsWith('timeout after');
    console.warn(
      JSON.stringify({
        operation: 'syncGroupJSON',
        step: 'ssm',
        error: isTimeout ? 'timeout' : err instanceof Error ? err.message : String(err),
      }),
    );
    return null;
  });

  if (!ssmResult) return;

  const params = ssmResult.Parameters ?? [];
  if (params.length < 2) {
    console.warn(
      JSON.stringify({
        operation: 'syncGroupJSON',
        step: 'ssm',
        error: `Expected 2 parameters, got ${params.length}`,
      }),
    );
    return;
  }

  const keyIdParam = params.find((p) => p.Name === SSM_KEY_ID_PATH);
  const secretParam = params.find((p) => p.Name === SSM_SECRET_PATH);

  if (!keyIdParam?.Value || !secretParam?.Value) {
    console.warn(
      JSON.stringify({
        operation: 'syncGroupJSON',
        step: 'ssm',
        error: 'One or both credential parameters are empty',
      }),
    );
    return;
  }

  const accessKeyId = keyIdParam.Value;
  const secretAccessKey = secretParam.Value;

  // Step 2: fetch groups + write to S3 (fail-soft: S3 errors logged, not rethrown)
  try {
    const db = await getPalmettoDBConnection();
    const groupRepo = db.getRepository(GroupEntity);

    const groups = await groupRepo.find({
      where: [{ pvVoid: 0 }, { pvVoid: IsNull() }],
      select: {
        pvGroupID: true,
        pvGroupName: true,
        pvGroupTitle: true,
        pvGroupComment: true,
        pvVoid: true,
        pvParentGroupID: true,
        pvIsAgency: true,
      },
    });

    const data = JSON.stringify(groups);
    const bytes = Buffer.byteLength(data, 'utf8');

    const s3 = new S3Client({
      region: REGION,
      credentials: { accessKeyId, secretAccessKey },
    });

    await withTimeout(
      s3.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: S3_KEY, Body: data, ContentType: 'application/json' })),
      TIMEOUT_MS,
    );

    console.info(JSON.stringify({ operation: 'syncGroupJSON', groupCount: groups.length, bytes }));
  } catch (err: unknown) {
    console.warn(
      JSON.stringify({
        operation: 'syncGroupJSON',
        step: 's3',
        error: err instanceof Error ? err.message : String(err),
      }),
    );
  }
};
