import { APIGatewayEvent } from 'aws-lambda';
import { clientErrorResponse, successResponse } from '@libs/response';
import { middyfy } from '@libs/lambda';
import { getGroupContactsByGroupId } from './controller';

const handler = async (event: APIGatewayEvent) => {
  try {
    const groupId = Number(event.pathParameters.groupId);
    if (!groupId) {
      return clientErrorResponse('Missing required Group ID!');
    }
    const data = await getGroupContactsByGroupId(groupId);
    return successResponse(data);
  } catch (error) {
    return clientErrorResponse(error);
  }
};

export const main = middyfy(handler);
