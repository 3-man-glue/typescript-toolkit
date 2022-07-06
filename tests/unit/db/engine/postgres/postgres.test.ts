import postgres, { Client }from 'pg'
import { PostgresEngine } from '@db/engine/postgres/postgres'
import { Engine } from '@db/engine/interfaces'
import { NotImplementedException } from '@http-kit/exception/not-implemented'
import { DBException } from '@http-kit/exception/db'

jest.mock('pg')

describe('PostgresEngine', () => {
  let postgresEngine: Engine
  const mockConfigService = {
    host: 'host',
    user: 'user',
    password: 'password',
    database: 'database',
  }

  beforeEach(() => {
    postgresEngine = new PostgresEngine(mockConfigService)
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
    it('should throw Not Implemented Exception when update method is called', () => {
      const error = new NotImplementedException('select method not implemented for Postgres Adaptor')
      let isThrown = false

      try {
        postgresEngine.select([], 'table')
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(NotImplementedException)
        expect(e).toEqual(error)
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
