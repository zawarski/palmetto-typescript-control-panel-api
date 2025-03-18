import { APIGatewayEvent } from 'aws-lambda';
import { middyfy } from '@libs/lambda';
import { clientErrorResponse, successResponse } from '@libs/response';
import { getGroupAll } from './controller';

const handler = async (event: APIGatewayEvent) => {
  try {
    const params = event.multiValueQueryStringParameters;
    const response = await getGroupAll(params);
    return successResponse(response);
  } catch (error) {
    return clientErrorResponse(error);
  }
};

export const main = middyfy(handler);
