import { createLogger } from 'winston'

jest.mock('winston', () => {
  return {
    createLogger: jest.fn(),
    transports: {
      Console: jest.fn().mockImplementation(() => ({ console: 'log' })),
      File: jest.fn().mockImplementation(() => ({ file: 'log' })),
    },
    format: {
      combine: jest.fn().mockReturnValue('combined-format'),
      timestamp: jest.fn(),
      errors: jest.fn(),
      printf: jest.fn(),
    },
  }
})

describe('createLogger', () => {
  const currentEnv = process.env

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env = { ...currentEnv }
  })

  describe('Log level', () => {
    it('Should be info level by default', () => {
      process.env[ 'APP_ENV' ] = undefined
      const expectedParams = {
        level: 'info',
        format: 'combined-format',
        transports: [
          { console: 'log' },
          { file: 'log' },
          { file: 'log' },
        ],
      }

      jest.isolateModules(() => jest.requireActual('@logger/logger'))

      expect(createLogger).toHaveBeenCalledTimes(1)
      expect(createLogger).toHaveBeenNthCalledWith(1, expectedParams)
    })

    it('Should be debug level when APP_ENV is development', () => {
      process.env[ 'APP_ENV' ] = 'development'
      const expectedParams = {
        level: 'debug',
        format: 'combined-format',
        transports: [
          { console: 'log' },
          { file: 'log' },
          { file: 'log' },
        ],
      }

      jest.isolateModules(() => jest.requireActual('@logger/logger'))

      expect(createLogger).toHaveBeenCalledTimes(1)
      expect(createLogger).toHaveBeenNthCalledWith(1, expectedParams)
    })
  })
})
