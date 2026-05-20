/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          // esbuild (production bundler) handles CJS/ESM interop automatically;
          // this flag makes ts-jest match that behaviour for default imports of CJS modules.
          esModuleInterop: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@functions/(.*)$': '<rootDir>/src/functions/$1',
    '^@libs/(.*)$': '<rootDir>/src/libs/$1',
    '^@entities/(.*)$': '<rootDir>/src/db/entities/$1',
    '^@db/(.*)$': '<rootDir>/src/db/$1',
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
    '^@templates/(.*)$': '<rootDir>/src/templates/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
};
