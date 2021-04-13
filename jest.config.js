module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageProvider: 'v8',
  collectCoverageFrom: ['src/**/*.ts'],
  timers: 'modern',
  injectGlobals: true,
  verbose: true,
  moduleNameMapper: {
    '^libs/(.*)$': '<rootDir>/src/libs/$1',
  },
}
