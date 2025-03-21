import { middyfy } from '@libs/lambda';
import { clientErrorResponse, successResponse } from '@libs/response';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { FromSchema } from 'json-schema-to-ts';
import { SubGroupSchema } from './schema';
import { postSubGroups } from './controller';

const handler: ValidatedEventAPIGatewayProxyEvent<typeof SubGroupSchema> = async (event) => {
  const payload: FromSchema<typeof SubGroupSchema> = event.body;
  try {
    const result = await postSubGroups(payload);
    return successResponse(result);
  } catch (error) {
    return clientErrorResponse(error);
  }
};

export const main = middyfy(handler);
