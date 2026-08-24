import 'reflect-metadata';
import 'typeorm-aurora-data-api-driver';
import { DataSource } from 'typeorm';
import { palmettoConfig, paramsStoreOption } from '@db/connection_config';

// getPalmettoDBConnection (@db/index) is not reused here: its default import of
// aws-param-store only resolves correctly once bundled through serverless-esbuild
// (the deployed Lambda path). Run directly through ts-node, that import is
// undefined -- so this script builds its own connection from the same config,
// using a plain require() to sidestep the interop gap.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const awsParamStore = require('aws-param-store');

interface DriftRow {
  pvDataID: number;
  pvGroupID: number;
  pvContactGroupID: number | null;
  pvAccountID: number;
  pvContactAccountID: number | null;
  pvEntryDate: string;
}

const DRIFT_QUERY = `
  SELECT pvDataID, pvGroupID, pvContactGroupID, pvAccountID, pvContactAccountID, pvEntryDate
  FROM group_contact
  WHERE pvVoid = 0
    AND (
      pvContactAccountID IS NULL OR pvContactAccountID <> pvAccountID
      OR pvContactGroupID IS NULL OR pvContactGroupID <> pvGroupID
    )
  ORDER BY pvEntryDate DESC
`;

async function connect() {
  const region = process.env.DB_REGION || 'us-east-1';
  const params = paramsStoreOption.mysql;
  const [resourceArn, secretArn] = await Promise.all([
    awsParamStore.getParameter(params.resourceArn, { region }),
    awsParamStore.getParameter(params.secretArn, { region }),
  ]);

  const configFile = { ...palmettoConfig, secretArn: '', resourceArn: '' };
  configFile.secretArn = secretArn.Value;
  configFile.resourceArn = resourceArn.Value;

  const dataSource = new DataSource(configFile);
  await dataSource.initialize();
  return dataSource;
}

async function main() {
  const dataSource = await connect();
  try {
    const rows: DriftRow[] = await dataSource.manager.query(DRIFT_QUERY);

    if (rows.length === 0) {
      console.log(
        'No drift found: every active group_contact row has matching pvAccountID/pvContactAccountID and pvGroupID/pvContactGroupID pairs.',
      );
      return;
    }

    console.log(`Found ${rows.length} active group_contact row(s) where the ID pairs diverge.`);
    console.log(
      'Each row here makes group_contact_view display/resolve a different account than pvAccountID names, ' +
        'and can silently block that pvAccountID from being re-added as a contact (getGroupContactsByGroupId ' +
        "checks pvContactAccountID for this reason -- see src/functions/contacts/controller.ts).",
    );
    console.table(rows);
    process.exitCode = 1;
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error('audit-group-contact-drift failed:', error);
  process.exitCode = 1;
});
