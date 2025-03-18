import { DataSourceOptions } from 'typeorm';
import palmettoEntities from './entities';

export const palmettoConfig: DataSourceOptions = {
  synchronize: false, // !: Set to always FALSE
  type: 'aurora-mysql',
  region: process.env.DB_REGION || 'us-east-1',
  secretArn: '',
  resourceArn: '',
  database: 'palmetto',
  entities: palmettoEntities,
  // logging: ['query', 'error'],
};

export const paramsStoreOption = {
  mysql: {
    secretArn: '/palmetto-serverless-loopback/all/auroraSecretArn',
    resourceArn: '/palmetto-serverless-loopback/all/auroraResourceArn',
  },
};
