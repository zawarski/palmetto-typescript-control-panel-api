import { clientErrorResponse, successResponse } from '@libs/response';
import { middyfy } from '@libs/lambda';
import { APIGatewayEvent } from 'aws-lambda';
import { deleteGroup } from './controller';

const handler = async (event: APIGatewayEvent) => {
  try {
    const groupID = parseInt(event.pathParameters.groupID);
    if (!groupID) return clientErrorResponse('Group ID is required');
    const response = await deleteGroup(groupID);
    return successResponse(response);
  } catch (error) {
    return clientErrorResponse(error);
  }
};

export const main = middyfy(handler);
