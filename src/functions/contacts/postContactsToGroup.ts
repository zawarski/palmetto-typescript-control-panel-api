import { middyfy } from '@libs/lambda';
import { clientErrorResponse, successResponse } from '@libs/response';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { FromSchema } from 'json-schema-to-ts';
import { ContactsSchema } from './schema';
import { postContactsToGroup } from './controller';

const handler: ValidatedEventAPIGatewayProxyEvent<typeof ContactsSchema> = async (event) => {
  const payload: FromSchema<typeof ContactsSchema> = event.body;
  try {
    const result = await postContactsToGroup(payload);
    return successResponse(result);
  } catch (error) {
    return clientErrorResponse(error);
  }
};

export const main = middyfy(handler);
