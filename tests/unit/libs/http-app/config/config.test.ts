import { ConfigService } from '@config/config'
import dotenv from 'dotenv'

jest.mock('dotenv', () => {
  return {
    config: jest.fn().mockReturnValue({
      parsed: {},
    }),
  }
})

describe('ConfigService', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  it('should use .env.example given APP_ENV is "dev"', () => {
    process.env['APP_ENV'] = 'dev'
    const expectedInput = {
      path: '.env.example',
    }
    new ConfigService()
    expect(dotenv.config).toHaveBeenCalledWith(expectedInput)
  })

  it('should use .env default given APP_ENV is not "dev"', () => {
    process.env['APP_ENV'] = 'staging'
    new ConfigService()
    expect(dotenv.config).toHaveBeenCalledWith()
  })
})
