/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',
  displayName: 'service_users',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/setupEnv.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
};

