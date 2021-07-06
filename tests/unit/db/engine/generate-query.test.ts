import { getInsertQueries, getSelectQuery } from 'libs/db/engine/generate-query'
import { Operation } from 'libs/db/interfaces'
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
  it('should return empty string given empty condition', () => {
    const expectedQuery = 'SELECT * FROM broadcast'
    const { query } = getSelectQuery({}, tableName)
    expect(query).toBe(expectedQuery)
  })

  it('should return valid query string given condition', () => {
    const condition = { status: { [Operation.EQ]: 1 } }
    const expectedQuery = 'SELECT * FROM broadcast WHERE status = ?'
    const { query } = getSelectQuery(condition, tableName)
    expect(query).toBe(expectedQuery)
  })

  it('should return valid query string given multiple condition', () => {
    const condition = { status: { [Operation.EQ]: 1 }, id: { IN: [ 1, 2, 3 ] } }
    const expectedQuery = 'SELECT * FROM broadcast WHERE status = ? AND id IN ?'
    const { query } = getSelectQuery(condition, tableName)
    expect(query).toBe(expectedQuery)
  })

  it('should return valid query string given condition with order', () => {
    const condition = { status: { order: 'asc', [Operation.EQ]: 1 } }
    const expectedQuery = 'SELECT * FROM broadcast WHERE status = ? ORDER BY status asc'
    const { query } = getSelectQuery(condition, tableName)
    expect(query).toBe(expectedQuery)
  })

  it('should return valid query string given condition with multiple orders', () => {
    const condition = { status: { [Operation.EQ]: 1, order: 'asc' }, id: { [Operation.EQ]: 1, order: 'asc' } }
    const expectedQuery = 'SELECT * FROM broadcast WHERE status = ? AND id = ? ORDER BY status asc,id asc'
    const { query } = getSelectQuery(condition, tableName)
    expect(query).toBe(expectedQuery)
  })
})
