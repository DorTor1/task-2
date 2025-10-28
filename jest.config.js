/** @type {import('jest').Config} */
module.exports = {
  projects: [
    '<rootDir>/api_gateway/jest.config.js',
    '<rootDir>/service_users/jest.config.js',
    '<rootDir>/service_orders/jest.config.js',
  ],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
};

