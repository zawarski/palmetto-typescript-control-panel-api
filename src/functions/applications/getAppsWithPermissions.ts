import { middyfy } from '@libs/lambda';
import { clientErrorResponse, successResponse } from '@libs/response';
import { getAppsWithPermissions } from './controller';

const handler = async () => {
  try {
    const response = await getAppsWithPermissions();
    return successResponse(response);
  } catch (error) {
    console.log(error);
    return clientErrorResponse(error);
  }
};

export const main = middyfy(handler);
