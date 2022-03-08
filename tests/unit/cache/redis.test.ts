import redis, { RedisClient } from 'redis'
import { CacheException } from '@http-kit/exception/cache'
import { Redis } from '@cache/redis'

const expectedConfig = {
  host: '1.2.3.4',
  port: 999,
  url: 'redis://redis-test.com/',
  password: 'expected_password',
  timeToLive: 999,
}
const mockClient = jest.fn() as unknown as RedisClient

afterAll(() => {
  jest.resetModules()
})

describe('Redis', () => {

  beforeEach(() => {
    jest.spyOn(redis, 'createClient').mockReturnValue(mockClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should setup client with the proper configuration', () => {
    const instanceUnderTest = new Redis(expectedConfig)

    expect(instanceUnderTest).toBeInstanceOf(Redis)
    expect(redis.createClient).toHaveBeenCalledTimes(1)
    expect(redis.createClient).toHaveBeenCalledWith(expectedConfig)
  })

  describe('get', () => {
    const expectedError = new Error('redis-get-error')
    const mockGet = jest.fn().mockImplementation((key, cb) => {
      switch (key) {
      case 'expectedKey':
        cb(undefined, 'expectedValue')
        break
      case 'expectedError':
        cb(expectedError)
        break
      case 'expectedNull':
        cb(undefined, null)
        break
      }
    })

    beforeEach(() => {
      jest.spyOn(redis, 'createClient').mockReturnValue({ get: mockGet } as unknown as RedisClient)
    })

    it('should get the given key properly', async () => {
      const instanceUnderTest = new Redis(expectedConfig)

      const retrievedValue = await instanceUnderTest.get('expectedKey')

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet).toHaveBeenCalledWith('expectedKey', expect.any(Function))
      expect(retrievedValue).toEqual('expectedValue')
    })

    it('should return undefined when it cannot find such a key', async () => {
      const instanceUnderTest = new Redis(expectedConfig)

      const retrievedValue = await instanceUnderTest.get('expectedNull')

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet).toHaveBeenCalledWith('expectedNull', expect.any(Function))
      expect(retrievedValue).toBeUndefined()
    })

    it('should throw when Redis cannot retrieve the value', async () => {
      const instanceUnderTest = new Redis(expectedConfig)
      let isThrown = false

      try {
        await instanceUnderTest.get('expectedError')
      } catch (error) {
        isThrown = true

        expect(error).toBeInstanceOf(CacheException)
        expect(error.input).toStrictEqual({ key: 'expectedError' })
        expect(error.cause).toStrictEqual(expectedError)
      }

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(isThrown).toBeTruthy()
    })
  })

  describe('set', () => {
    const expectedError = new Error('redis-set-error')
    // eslint-disable-next-line max-params
    const mockSet = jest.fn().mockImplementation((key, value, _mode, _time, cb) => {
      switch (key) {
      case 'expectedKey':
        cb(undefined, value)
        break
      case 'expectedError':
        cb(expectedError)
        break
      }
    })

    beforeEach(() => {
      jest.spyOn(redis, 'createClient').mockReturnValue({ set: mockSet } as unknown as RedisClient)
    })

    it('should set the given key properly', async () => {
      const instanceUnderTest = new Redis(expectedConfig)

      await instanceUnderTest.set('expectedKey', 'expectedValue')

      expect(mockSet).toHaveBeenCalledTimes(1)
      expect(mockSet).toHaveBeenCalledWith(
        'expectedKey', 'expectedValue', 'EX', (60 * 60 * 24) * 999, expect.any(Function),
      )
    })

    it('should throw when Redis cannot set the given value', async () => {
      const instanceUnderTest = new Redis(expectedConfig)
      let isThrown = false

      try {
        await instanceUnderTest.set('expectedError', 'expectedValue')
      } catch (error) {
        isThrown = true

        expect(error).toBeInstanceOf(CacheException)
        expect(error.input).toStrictEqual({ key: 'expectedError', value: 'expectedValue' })
        expect(error.cause).toStrictEqual(expectedError)
      }

      expect(mockSet).toHaveBeenCalledTimes(1)
      expect(isThrown).toBeTruthy()
    })
  })

  describe('delete', () => {
    const expectedError = new Error('redis-delete-error')
    const mockDelete = jest.fn().mockImplementation((key, cb) => {
      switch (key) {
      case 'expectedFound':
        cb(undefined, 1)
        break
      case 'expectedNotFound':
        cb(undefined, 0)
        break
      case 'expectedError':
        cb(expectedError)
        break
      }
    })

    beforeEach(() => {
      jest.spyOn(redis, 'createClient').mockReturnValue({ del: mockDelete } as unknown as RedisClient)
    })

    it('should delete the given key properly', async () => {
      const instanceUnderTest = new Redis(expectedConfig)

      await instanceUnderTest.delete('expectedFound')

      expect(mockDelete).toHaveBeenCalledTimes(1)
      expect(mockDelete).toHaveBeenCalledWith('expectedFound', expect.any(Function))
    })

    it('should throw when the given key is not existed', async () => {
      const instanceUnderTest = new Redis(expectedConfig)
      let isThrown = false

      try {
        await instanceUnderTest.delete('expectedNotFound')
      } catch (error) {
        isThrown = true

        expect(error).toBeInstanceOf(CacheException)
        expect(error.input).toStrictEqual({ key: 'expectedNotFound' })
      }

      expect(mockDelete).toHaveBeenCalledTimes(1)
      expect(isThrown).toBeTruthy()
    })

    it('should throw when Redis cannot delete such a key', async () => {
      const instanceUnderTest = new Redis(expectedConfig)
      let isThrown = false

      try {
        await instanceUnderTest.delete('expectedError')
      } catch (error) {
        isThrown = true

        expect(error).toBeInstanceOf(CacheException)
        expect(error.input).toStrictEqual({ key: 'expectedError' })
        expect(error.cause).toStrictEqual(expectedError)
      }

      expect(mockDelete).toHaveBeenCalledTimes(1)
      expect(isThrown).toBeTruthy()
    })
  })

  describe('closeConnection', () => {
    const mockEnd = jest.fn()
    beforeEach(() => {
      jest.spyOn(redis, 'createClient').mockReturnValue({ end: mockEnd } as unknown as RedisClient)
    })

    it('should end the redis client connection', () => {
      const instanceUnderTest = new Redis(expectedConfig)

      instanceUnderTest.closeConnection()

      expect(mockEnd).toHaveBeenCalledTimes(1)
    })
  })
})
