import type { AWS } from '@serverless/typescript';
import functions from '@functions/index';

const serverlessConfiguration: AWS = {
  service: 'palmetto-control-panel-api',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-dotenv-plugin'],
  useDotenv: true,
  provider: {
    name: 'aws',
    profile: 'default',
    region: 'us-east-1',
    runtime: 'nodejs20.x',
    stage: 'prod',
    timeout: 300,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
      binaryMediaTypes: ['application/*', 'image/*', '*/*'],
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['rds-data:*', 'ssm:GetParameter', 'ssm:GetParameters'],
            Resource: '*',
          },
          {
            Effect: 'Allow',
            Action: 'secretsmanager:GetSecretValue',
            Resource: {
              'Fn::Join': [
                '',
                ['arn:aws:secretsmanager:${self:provider.region}:', { Ref: 'AWS::AccountId' }, ':secret:*'],
              ],
            },
          },
          {
            Effect: 'Allow',
            Action: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
            Resource: 'arn:aws:logs:*:*:*',
          },
        ],
      },
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      PASSKEY: '253D3FB468A0E24677C28A624BE0F939',
      NODE_ENV: '${env.NODE_ENV}',
      DB_SECRET_ARN: '',
      DB_RESOURCE_ARN: '',
      DB_NAME_AWS: 'palmetto',
      DB_REGION: 'us-east-1',
      TOKEN_SECRET: 'b65d26213541277d72f9a92e60e2bf6692dd139c8461497539f95369f7677',
    },
  },
  functions: functions,
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: [],
      target: 'node20',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    mySqlDatabase: {
      all: 'palmetto',
    },
    auroraSecretArn: {
      all: '*',
    },
    auroraResourceArn: {
      all: '*',
    },
  },
};

module.exports = serverlessConfiguration;
