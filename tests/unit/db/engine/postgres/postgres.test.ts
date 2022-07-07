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
    it('should throw Not Implemented Exception when update method is called', () => {
      const error = new NotImplementedException('insert method not implemented for Postgres Adaptor')
      let isThrown = false

      try {
        postgresEngine.insert([], 'table')
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(NotImplementedException)
        expect(e).toEqual(error)
      }

      expect(isThrown).toBeTruthy()
    })
  })

  describe('update', () => {
    it('should throw Not Implemented Exception when update method is called', () => {
      const error = new NotImplementedException('update method not implemented for Postgres Adaptor')
      let isThrown = false

      try {
        postgresEngine.update([], [ {} ], 'table')
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(NotImplementedException)
        expect(e).toEqual(error)
      }

      expect(isThrown).toBeTruthy()
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
