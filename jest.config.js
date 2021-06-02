module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageProvider: 'v8',
  collectCoverageFrom: [ 'src/**/*.ts' ],
  coveragePathIgnorePatterns: [ 'src/app.ts', 'interfaces.ts' ],
  timers: 'modern',
  injectGlobals: true,
  verbose: true,
  moduleNameMapper: {
    '^libs/(.*)$': '<rootDir>/src/libs/$1',
  },
}
