import { handlerPath } from '@libs/handler-resolver';
import { GroupSchema } from './schema';

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

export const postGroup = {
  handler: `${handlerPath(__dirname)}/postGroup.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'api/group_management',
        cors: true,
        request: {
          schemas: {
            'application/json': GroupSchema,
          },
        },
        authorizer: {
          arn: 'arn:aws:cognito-idp:us-east-1:072516061299:userpool/us-east-1_3f1efBpoo',
        },
      },
    },
  ],
};
