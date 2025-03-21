import { handlerPath } from '@libs/handler-resolver';

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
