import { build } from 'esbuild';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { tmpdir } from 'os';
import { join } from 'path';
import { types } from 'util';

// Middy 7 ships ESM-only, which Jest's CommonJS resolver cannot load from the TypeScript
// source. The test bundles `lambda.ts` the way serverless-esbuild does for Lambda and
// loads that CommonJS output, so it exercises what the nodejs24.x runtime receives.

type LambdaHandler = (
  event: unknown,
  context: unknown,
) => Promise<{ statusCode: number; headers?: Record<string, string> }>;
type Wrapper = (handler: (event: { body: unknown }) => Promise<{ statusCode: number; body: string }>) => LambdaHandler;

const REQUEST_ORIGIN = 'https://client.example.test';

let workDir: string;
let wrappers: { middyfy: Wrapper; middyfyReport: Wrapper };
const WRAPPER_NAMES: Array<keyof typeof wrappers> = ['middyfy', 'middyfyReport'];

const buildEvent = (body: string) => ({
  httpMethod: 'POST',
  path: '/synthetic',
  resource: '/synthetic',
  headers: { 'Content-Type': 'application/json', Origin: REQUEST_ORIGIN },
  multiValueHeaders: {},
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  pathParameters: null,
  stageVariables: null,
  isBase64Encoded: false,
  requestContext: { httpMethod: 'POST', path: '/synthetic', stage: 'test' },
  body,
});

const buildContext = () => ({
  awsRequestId: 'synthetic-request',
  functionName: 'synthetic-function',
  getRemainingTimeInMillis: () => 30000,
});

beforeAll(async () => {
  const result = await build({
    entryPoints: [join(__dirname, 'lambda.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node24',
    write: false,
  });
  workDir = mkdtempSync(join(tmpdir(), 'lambda-bundle-'));
  const bundlePath = join(workDir, 'lambda.cjs');
  writeFileSync(bundlePath, result.outputFiles[0].text);
  wrappers = createRequire(bundlePath)(bundlePath);
});

afterAll(() => {
  if (workDir) rmSync(workDir, { recursive: true, force: true });
});

it.each(WRAPPER_NAMES)(
  '%s builds an async callback-free handler that parses JSON, applies CORS and rejects malformed bodies',
  async (wrapperName) => {
    const inner = jest.fn(async (event: { body: unknown }) => ({ statusCode: 201, body: JSON.stringify(event.body) }));
    const handler = wrappers[wrapperName](inner);

    expect(types.isAsyncFunction(handler)).toBe(true);
    expect(handler.length).toBeLessThanOrEqual(2);

    const response = await handler(buildEvent('{"a":1}'), buildContext());

    expect(inner).toHaveBeenCalledTimes(1);
    expect(inner.mock.calls[0][0].body).toEqual({ a: 1 });
    expect(response.statusCode).toBe(201);
    expect(response.headers?.['Access-Control-Allow-Origin']).toBe(REQUEST_ORIGIN);

    inner.mockClear();

    await expect(handler(buildEvent('{"a":'), buildContext())).rejects.toMatchObject({ statusCode: 422 });
    expect(inner).not.toHaveBeenCalled();
  },
);
