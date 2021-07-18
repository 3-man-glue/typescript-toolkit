module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageProvider: 'v8',
  collectCoverageFrom: [ 'src/**/*.ts' ],
  coveragePathIgnorePatterns: [ 'interfaces.ts' ],
  timers: 'modern',
  injectGlobals: true,
  verbose: true,
  moduleNameMapper: {
    '^@logger/(.*)$': '<rootDir>/src/logger/$1',
    '^@http/(.*)$': '<rootDir>/src/http/$1',
    '^@db/(.*)$': '<rootDir>/src/db/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
  },
  roots: [ '<rootDir>/tests/' ],
}
