import { handlerPath } from '@libs/handler-resolver';
import { ApplicationSchema } from './schema';

export const getServices = {
  handler: `${handlerPath(__dirname)}/getServices.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'api/applications/services',
        cors: true,
        authorizer: {
          arn: 'arn:aws:cognito-idp:us-east-1:072516061299:userpool/us-east-1_3f1efBpoo',
        },
      },
    },
  ],
};

export const getAppsWithPermissions = {
  handler: `${handlerPath(__dirname)}/getAppsWithPermissions.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'api/applications/apps-with-permissions',
        cors: true,
        authorizer: {
          arn: 'arn:aws:cognito-idp:us-east-1:072516061299:userpool/us-east-1_3f1efBpoo',
        },
      },
    },
  ],
};

export const postAppsByGroup = {
  handler: `${handlerPath(__dirname)}/postAppsByGroup.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'api/applications',
        cors: true,
        request: {
          schemas: {
            'application/json': ApplicationSchema,
          },
        },
        authorizer: {
          arn: 'arn:aws:cognito-idp:us-east-1:072516061299:userpool/us-east-1_3f1efBpoo',
        },
      },
    },
  ],
};
