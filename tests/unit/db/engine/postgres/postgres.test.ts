import postgres, { Client }from 'pg'
import { PostgresEngine } from '@db/engine/postgres/postgres'
import { Engine } from '@db/engine/interfaces'
import { NotImplementedException } from '@http-kit/exception/not-implemented'
import { DBException } from '@http-kit/exception/db'
import { Operation } from '@db/interfaces'

jest.mock('pg')

describe('PostgresEngine', () => {
  let postgresEngine: Engine
  let mockClientInstance: postgres.Client
  const mockConfigService = {
    host: 'host',
    user: 'user',
    password: 'password',
    database: 'database',
  }

  beforeEach(() => {
    postgresEngine = new PostgresEngine(mockConfigService)
    mockClientInstance = (postgres.Client as unknown as jest.Mock).mock.instances[ 0 ]
  })

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('should return Instance of PostgresEngine', () => {
    expect(postgresEngine).toBeInstanceOf(PostgresEngine)
    expect(Client).toHaveBeenCalledTimes(1)
  })

  describe('select', () => {
    it('should return empty list when result does not contain row', async () => {
      mockClientInstance.query = jest.fn().mockResolvedValue({})
      const expectedQuery = 'SELECT * FROM table WHERE id = $1'
      const expectedParams = [ 0 ]

      const output = await postgresEngine.select(
        {
          id: {
            [ Operation.EQ ]: 0,
          },
        },
        'table',
      )

      expect(output).toHaveLength(0)
      expect(mockClientInstance.query).toHaveBeenCalledWith(expectedQuery, expectedParams)
      expect(mockClientInstance.query).toHaveBeenCalledTimes(1)
    })

    it('should return list of items when result does contain row', async () => {
      mockClientInstance.query = jest.fn().mockResolvedValue({ rows: [ { k: 1 }, { k: 2 } ] })
      const expectedOutput = [ { k: 1 }, { k: 2 } ]
      const expectedQuery = 'SELECT * FROM table WHERE id = $1 AND status = $2'
      const expectedParams = [ 0, 1 ]

      const output = await postgresEngine.select(
        {
          id: {
            [ Operation.EQ ]: 0,
          },
          status: {
            [ Operation.EQ ]: 1,
          },
        },
        'table',
      )

      expect(output).toStrictEqual(expectedOutput)
      expect(mockClientInstance.query).toHaveBeenCalledWith(expectedQuery, expectedParams)
      expect(mockClientInstance.query).toHaveBeenCalledTimes(1)
    })

    it('should throw db exception when query is error', async () => {
      let isThrown = false
      const mockError = new Error('error')
      mockClientInstance.query = jest.fn().mockRejectedValue(mockError)
      const expectThrow = new DBException(mockError.message)
        .withCause(mockError)
        .withInput({
          condition: {},
          tableName: 'table',
          options: undefined,
        })

      try {
        await postgresEngine.select({}, 'table')
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
        expect(error.toJSON()).toEqual(expectThrow.toJSON())
      }

      expect(isThrown).toBeTruthy()
    })
  })

  describe('insert', () => {
    it('should call query when given valid input', async () => {
      const expectedQuery = 'INSERT INTO table (status) VALUES ($1),($2)'
      const expectedParams = [ 1, 2 ]
      mockClientInstance.query = jest.fn().mockResolvedValue({})

      await postgresEngine.insert([ { status: 1 }, { status: 2 } ], 'table')

      expect(mockClientInstance.query).toHaveBeenCalledWith(
        expectedQuery, expectedParams,
      )
      expect(mockClientInstance.query).toHaveBeenCalledTimes(1)
    })

    it('should throw db exception when query is error', async () => {
      let isThrown = false
      const mockError = new Error('error')
      mockClientInstance.query = jest.fn().mockRejectedValue(mockError)
      const expectThrow = new DBException(mockError.message)
        .withCause(mockError)
        .withInput({
          data: [ { status: 1 } ],
          tableName: 'table',
        })

      try {
        await postgresEngine.insert([ { status: 1 } ], 'table')
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
        expect(error.toJSON()).toEqual(expectThrow.toJSON())
      }

      expect(mockClientInstance.query).toHaveBeenCalledTimes(1)
      expect(isThrown).toBeTruthy()
    })

    it('should throw error when given invalid input', async () => {
      await expect(postgresEngine.insert(
        [ { status: 1 }, { segmentId: 2 }, { status: 2, segmentId: 1 } ], 'table'))
        .rejects.toThrowError('Data is invalid formatted')
      expect(mockClientInstance.query).toHaveBeenCalledTimes(0)
    })

    it('should throw error when given empty data', async () => {
      await expect(postgresEngine.insert(
        [], 'table'))
        .rejects.toThrowError('Data not provide')
      expect(mockClientInstance.query).toHaveBeenCalledTimes(0)
    })
  })

  describe('update', () => {
    it('should call query when given valid input', async () => {
      const data = [ { status: 1, segmentId: 2 }, { status: 3, segmentId: 4 } ]
      const condition = [ { status: { [Operation.EQ]: 1 }, id: { [Operation.EQ]: 3 } },
        { status: { [Operation.EQ]: 1 }, id: { [Operation.EQ]: 4 } } ]
      const expectedQuery = [ 'UPDATE table SET status = $1, segmentId = $2 WHERE status = 1 AND id = 3',
        'UPDATE table SET status = $1, segmentId = $2 WHERE status = 1 AND id = 4' ]
      const expectedParams = [ [ 1, 2 ], [ 3, 4 ] ]
      mockClientInstance.query = jest.fn().mockResolvedValue({})

      await postgresEngine.update(data, condition, 'table')

      expect(mockClientInstance.query).toHaveBeenCalledWith(
        expectedQuery[0], expectedParams[0],
      )
      expect(mockClientInstance.query).toHaveBeenCalledWith(
        expectedQuery[1], expectedParams[1],
      )
      expect(mockClientInstance.query).toHaveBeenCalledTimes(2)
    })

    it('should throw db exception when query is error', async () => {
      const data = [ { status: 1, segmentId: 2 }, { status: 3, segmentId: 4 } ]
      const condition = [ { status: { [Operation.EQ]: 1 }, id: { [Operation.EQ]: 3 } },
        { status: { [Operation.EQ]: 1 }, id: { [Operation.EQ]: 4 } } ]
      let isThrown = false
      const mockError = new Error('error')
      mockClientInstance.query = jest.fn().mockRejectedValue(mockError)
      const expectThrow = new DBException(mockError.message)
        .withCause(mockError)
        .withInput({
          data: data,
          condition: condition,
          tableName: 'table',
        })

      try {
        await postgresEngine.update(data, condition, 'table')
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
        expect(error.toJSON()).toEqual(expectThrow.toJSON())
      }

      expect(mockClientInstance.query).toHaveBeenCalledTimes(data.length)
      expect(isThrown).toBeTruthy()
    })

    it('should throw error when condition lenghth not equal data length', async () => {
      const data = [ { status: 1, segmentId: 2 }, { status: 3, segmentId: 4 } ]
      const condition = [ { status: { [Operation.EQ]: 1 }, id: { [Operation.EQ]: 3 } } ]
      await expect(postgresEngine.update(
        data, condition, 'table'))
        .rejects.toThrowError('Data is invalid formatted')
      expect(mockClientInstance.query).toHaveBeenCalledTimes(0)
    })

    it('should throw error when given invalid input', async () => {
      const data = [ { status: {}, segmentId: 2 } ]
      const condition = [ { status: { [Operation.EQ]: 1 }, id: { [Operation.EQ]: 3 } } ]
      await expect(postgresEngine.update(
        data, condition, 'table'))
        .rejects.toThrowError('Data is invalid formatted')
      expect(mockClientInstance.query).toHaveBeenCalledTimes(0)
    })

    it('should throw error when given empty data', async () => {
      await expect(postgresEngine.update(
        [], [], 'table'))
        .rejects.toThrowError('Data not provide')
      expect(mockClientInstance.query).toHaveBeenCalledTimes(0)
    })
  })

  describe('delete', () => {
    it('should throw Not Implemented Exception when update method is called', () => {
      const error = new NotImplementedException('delete method not implemented for Postgres Adaptor')
      let isThrown = false

      try {
        postgresEngine.delete({}, 'table')
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(NotImplementedException)
        expect(e).toEqual(error)
      }

      expect(isThrown).toBeTruthy()
    })
  })

  it('should throw DB Exception when postgres connection is error', () => {
    let isThrown = false
    const mockError = new Error('error')
    const expectThrow = new DBException(mockError.message)
      .withCause(mockError)
      .withInput({
        host: mockConfigService.host,
        user: mockConfigService.user,
        password: mockConfigService.password,
        database: mockConfigService.database,
      })
    jest.spyOn(postgres, 'Client').mockImplementation(() => {
      throw mockError
    })

    try {
      new PostgresEngine(mockConfigService)
    } catch (error) {
      isThrown = true
      expect(error).toBeInstanceOf(DBException)
      expect(error.toJSON()).toEqual(expectThrow.toJSON())
    }

    expect(isThrown).toBeTruthy()
  })
})
