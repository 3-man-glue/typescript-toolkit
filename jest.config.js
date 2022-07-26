module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageProvider: 'v8',
  collectCoverageFrom: ['./src/**/*.ts'],
  coveragePathIgnorePatterns: ['interfaces.ts', 'logger.ts', '<rootDir>/src/http-kit/exception/'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  reporters: ['default', 'jest-junit'],
  timers: 'modern',
  injectGlobals: true,
  verbose: true,
  moduleNameMapper: {
    '^@logger/(.*)$': '<rootDir>/src/logger/$1',
    '^@http-kit/(.*)$': '<rootDir>/src/http-kit/$1',
    '^@db/(.*)$': '<rootDir>/src/db/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@ddd/(.*)$': '<rootDir>/src/ddd/$1',
    '^@cache/(.*)$': '<rootDir>/src/cache/$1',
    '^@mq/(.*)$': '<rootDir>/src/mq/$1',
    '^@scheduler/(.*)$': '<rootDir>/src/scheduler/$1',
    '^@event-stream/(.*)$': '<rootDir>/src/event-stream/$1',
    '^@gcp/(.*)$': '<rootDir>/src/gcp/$1',
    '^@media/(.*)$': '<rootDir>/src/media/$1',
    '^firebase-admin/(.*)$': '<rootDir>/node_modules/firebase-admin/lib/$1',
  },
  roots: ['<rootDir>/tests/'],
}


