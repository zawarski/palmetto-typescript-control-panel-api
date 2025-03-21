import { middyfy } from '@libs/lambda';
import { clientErrorResponse, successResponse } from '@libs/response';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { FromSchema } from 'json-schema-to-ts';
import { GroupSchema } from './schema';
import { postGroup } from './controller';

const handler: ValidatedEventAPIGatewayProxyEvent<typeof GroupSchema> = async (event) => {
  const payload: FromSchema<typeof GroupSchema> = event.body;
  try {
    const result = await postGroup(payload);
    return successResponse(result);
  } catch (error) {
    return clientErrorResponse(error);
  }
};

export const main = middyfy(handler);
