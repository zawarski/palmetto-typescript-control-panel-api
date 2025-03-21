import { middyfy } from '@libs/lambda';
import { clientErrorResponse, successResponse } from '@libs/response';
import { getServices } from './controller';

const handler = async () => {
  try {
    const response = await getServices();
    return successResponse(response);
  } catch (error) {
    console.log(error);
    return clientErrorResponse(error);
  }
};

export const main = middyfy(handler);
