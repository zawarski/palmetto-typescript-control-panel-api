import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpContentEncoding from '@middy/http-content-encoding';

export const middyfyReport = (handler) => {
  return middy(handler)
    .use(
      cors({
        credentials: true,
        origins: ['*'],
      }),
    )
    .use(
      httpJsonBodyParser({
        disableContentTypeError: true,
      }),
    )
    .use(httpContentEncoding());
};

export const middyfy = (handler) => {
  return middy(handler)
    .use(
      cors({
        credentials: true,
        origins: ['*'],
      }),
    )
    .use(httpEventNormalizer())
    .use(
      httpJsonBodyParser({
        disableContentTypeError: true,
      }),
    );
};
