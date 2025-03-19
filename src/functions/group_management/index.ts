import { handlerPath } from '@libs/handler-resolver';

export const getGroupAll = {
  handler: `${handlerPath(__dirname)}/getGroupAll.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'api/group_management',
        cors: true,
        authorizer: {
          arn: 'arn:aws:cognito-idp:us-east-1:072516061299:userpool/us-east-1_3f1efBpoo',
        },
      },
    },
  ],
};

export const getGroupByID = {
  handler: `${handlerPath(__dirname)}/getGroupByID.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'api/group_management/{groupID}',
        cors: true,
        request: {
          parameters: {
            paths: {
              groupID: true,
            },
          },
        },
        authorizer: {
          arn: 'arn:aws:cognito-idp:us-east-1:072516061299:userpool/us-east-1_3f1efBpoo',
        },
      },
    },
  ],
};

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
