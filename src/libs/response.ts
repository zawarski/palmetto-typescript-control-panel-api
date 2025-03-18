export const successResponse = (response: Record<string, unknown> | object | string) => {
  return {
    statusCode: 200,
    isBase64Encoded: false,
    body: JSON.stringify(response),
  };
};

export const clientErrorResponse = (response: object | string) => {
  return {
    statusCode: 400,
    isBase64Encoded: false,
    body: JSON.stringify(response),
  };
};
