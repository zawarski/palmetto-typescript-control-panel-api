import { handlerPath } from '@libs/handler-resolver';
import { GroupSchema, SubGroupSchema } from './schema';

export const deleteGroup = {
  handler: `${handlerPath(__dirname)}/deleteGroup.main`,
  events: [
    {
      http: {
        method: 'delete',
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
        path: 'api/group_management/group',
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

export const postSubGroups = {
  handler: `${handlerPath(__dirname)}/postSubGroups.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'api/group_management/subgroups',
        cors: true,
        request: {
          schemas: {
            'application/json': SubGroupSchema,
          },
        },
        authorizer: {
          arn: 'arn:aws:cognito-idp:us-east-1:072516061299:userpool/us-east-1_3f1efBpoo',
        },
      },
    },
  ],
};
