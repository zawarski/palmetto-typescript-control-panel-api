import { middyfy } from '@libs/lambda';
import { clientErrorResponse, successResponse } from '@libs/response';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { FromSchema } from 'json-schema-to-ts';
import { ApplicationSchema } from './schema';
import { postAppsByGroup } from './controller';

const handler: ValidatedEventAPIGatewayProxyEvent<typeof ApplicationSchema> = async (event) => {
  const payload: FromSchema<typeof ApplicationSchema> = event.body;
  try {
    const result = await postAppsByGroup(payload);
    return successResponse(result);
  } catch (error) {
    return clientErrorResponse(error);
  }
};

export const main = middyfy(handler);
