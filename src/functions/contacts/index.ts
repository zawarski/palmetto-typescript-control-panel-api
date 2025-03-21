import { handlerPath } from '@libs/handler-resolver';
import { ContactsSchema } from './schema';

export const getGroupContactsByGroupId = {
  handler: `${handlerPath(__dirname)}/getGroupContactsByGroupId.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'api/contacts/{groupId}',
        cors: true,
        request: {
          parameters: {
            paths: {
              groupId: true,
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

export const postContactsToGroup = {
  handler: `${handlerPath(__dirname)}/postContactsToGroup.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'api/contacts',
        cors: true,
        request: {
          schemas: {
            'application/json': ContactsSchema,
          },
        },
        authorizer: {
          arn: 'arn:aws:cognito-idp:us-east-1:072516061299:userpool/us-east-1_3f1efBpoo',
        },
      },
    },
  ],
};
