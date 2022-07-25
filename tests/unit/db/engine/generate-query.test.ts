import {
  getInsertQueries,
  getSelectQuery,
  getUpdateCounterQuery
} from '@db/engine/generate-query'
import { Operation } from '@db/interfaces'

describe('GetInsertQuery', () => {
  const tableName = 'broadcast'
  it('should throw error given empty array', () => {
    const expectedError = 'Data not provide'
    expect(() => getInsertQueries([], tableName)).toThrowError(expectedError)
  })

  it('should throw error given array with empty object', () => {
    const expectedError = 'Data not provide'
    expect(() => getInsertQueries([ {} ], tableName)).toThrowError(expectedError)
  })

  it('should return valid query given valid data', () => {
    const expectedInsertQuery = [ { query: 'INSERT INTO broadcast (status,segmentId) VALUES (?,?)', params: [ 1, 1 ] } ]
    const insertQuery = getInsertQueries( [ { status: 1, segmentId: 1 } ], tableName)
    expect(insertQuery).toStrictEqual(expectedInsertQuery)
  })

  it('should return valid query given valid multiple data', () => {
    const expectedQueries = [
      { query: 'INSERT INTO broadcast (status) VALUES (?)', params: [ 1 ] },
      { query: 'INSERT INTO broadcast (status) VALUES (?)', params: [ 2 ] },
    ]
    const insertQueries = getInsertQueries( [ { status: 1 }, { status: 2 } ], tableName)
    expect(insertQueries).toStrictEqual(expectedQueries)
  })
})

describe('GetConditionParams', () => {
  it('should return valid condition given no value ', () => {
    const { params } = getSelectQuery({ status: { order: 'asc' } }, 'user')
    expect(params).toStrictEqual([])
  })

  it('should return valid condition given falsy value', () => {
    const expectedParams = [ 0 ]
    const { params } = getSelectQuery({ status: { [Operation.EQ]: 0, order: 'asc' } }, 'user')
    expect(params).toStrictEqual(expectedParams)

  })

  it('should return valid condition given empty string', () => {
    const expectedParams = [ '' ]
    const { params } = getSelectQuery({ status: { order: 'asc', [Operation.EQ]: '' } }, 'user')
    expect(params).toStrictEqual(expectedParams)
  })
})

describe('GetSelectQuery', () => {
  const tableName = 'broadcast'
  it('should return empty string with empty condition', () => {
    const expectedQuery = 'SELECT * FROM broadcast'
    const { query } = getSelectQuery({}, tableName)
    expect(query).toBe(expectedQuery)
  })

  it('should return empty string with condition is empty', () => {
    const expectedQuery = 'SELECT * FROM broadcast'
    const { query } = getSelectQuery({ status: {} }, tableName)
    expect(query).toBe(expectedQuery)
  })

  it('should return valid query string with condition', () => {
    const condition = { status: { [Operation.EQ]: 1 } }
    const expectedQuery = 'SELECT * FROM broadcast WHERE status = ?'
    const { query } = getSelectQuery(condition, tableName)
    expect(query).toBe(expectedQuery)
  })

  it('should return valid query string when set multiple condition', () => {
    const condition = { status: { [Operation.EQ]: 1 }, id: { IN: [ 1, 2, 3 ] } }
    const expectedQuery = 'SELECT * FROM broadcast WHERE status = ? AND id IN ?'
    const { query } = getSelectQuery(condition, tableName)
    expect(query).toBe(expectedQuery)
  })

  it('should return valid query string when set condition with order', () => {
    const condition = { status: { order: 'asc', [Operation.EQ]: 1 } }
    const expectedQuery = 'SELECT * FROM broadcast WHERE status = ? ORDER BY status asc'
    const { query } = getSelectQuery(condition, tableName)
    expect(query).toBe(expectedQuery)
  })

  it('should return valid query string when set condition with multiple orders', () => {
    const condition = { status: { [Operation.EQ]: 1, order: 'asc' }, id: { [Operation.EQ]: 1, order: 'asc' } }
    const expectedQuery = 'SELECT * FROM broadcast WHERE status = ? AND id = ? ORDER BY status asc,id asc'
    const { query } = getSelectQuery(condition, tableName)
    expect(query).toBe(expectedQuery)
  })

  describe('options', () => {
    it('should return valid query string with raw field selector', () => {
      const options = { rawSelect: 'a, b, c' }
      const expectedQuery = 'SELECT a, b, c FROM broadcast'
      const { query } = getSelectQuery({ }, tableName, options)
      expect(query).toBe(expectedQuery)
    })

    it('should return valid query string with limit', () => {
      const options = { rawSelect: 'a, b, c', limit: 20 }
      const expectedQuery = 'SELECT a, b, c FROM broadcast LIMIT 20'
      const { query } = getSelectQuery({ }, tableName, options)
      expect(query).toBe(expectedQuery)
    })

    it('should return valid query string with allow filtering', () => {
      const options = { rawSelect: 'a, b, c', limit: 20, allowFiltering: true }
      const expectedQuery = 'SELECT a, b, c FROM broadcast ALLOW FILTERING LIMIT 20'
      const { query } = getSelectQuery({ }, tableName, options)
      expect(query).toBe(expectedQuery)
    })
  })

  describe('GetUpdateCounterQuery', () => {
    it('should return base query', () => {
      const { query } = getUpdateCounterQuery({ status: 1 }, 1)
      expect(query).toBe('UPDATE counter SET value = value + ? WHERE status = ?')
    })
  })
})
