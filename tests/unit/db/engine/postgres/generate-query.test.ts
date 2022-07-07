import { getSelectQuery } from '@db/engine/postgres/generate-query'
import { Operation } from '@db/interfaces'

describe('GetConditionParams', () => {
  it('should return empty array when no given value', () => {
    const { params } = getSelectQuery({ status: { order: 'asc' } }, 'table')
    expect(params).toStrictEqual([])
  })

  it('should return array with number when given value with number', () => {
    const expectedParams = [ 1 ]
    const { params } = getSelectQuery({ status: { [Operation.EQ]: 1, order: 'asc' } }, 'table')
    expect(params).toStrictEqual(expectedParams)
  })

  it('should return array with empty string when given value with empty string', () => {
    const expectedParams = [ '' ]
    const { params } = getSelectQuery({ status: { order: 'asc', [Operation.EQ]: '' } }, 'table')
    expect(params).toStrictEqual(expectedParams)
  })
})

describe('GetSelectQuery', () => {
  const tableName = 'table'
  it('should return base query when empty condition', () => {
    const expectedBaseQuery = 'SELECT * FROM table'
    const { query } = getSelectQuery({}, tableName)
    expect(query).toBe(expectedBaseQuery)
  })

  it('should return base query with where condition when given operation condition', () => {
    const condition = { status: { [Operation.EQ]: 1 } }
    const expectedQuery = 'SELECT * FROM table WHERE status = $1'
    const { query } = getSelectQuery(condition, tableName)
    expect(query).toBe(expectedQuery)
  })

  it('should return base query with multiple where condition when given multiple operation condition', () => {
    const condition = { status: { [Operation.EQ]: 1 }, id: { IN: [ 1, 2, 3 ] } }
    const expectedQuery = 'SELECT * FROM table WHERE status = $1 AND id IN $2'
    const { query } = getSelectQuery(condition, tableName)
    expect(query).toBe(expectedQuery)
  })

  it('should return valid query string when set condition with order', () => {
    const condition = { status: { order: 'asc', [Operation.EQ]: 1 } }
    const expectedQuery = 'SELECT * FROM table WHERE status = $1 ORDER BY status asc'
    const { query } = getSelectQuery(condition, tableName)
    expect(query).toBe(expectedQuery)
  })

  it('should return valid query string when set condition with multiple orders', () => {
    const condition = { status: { [Operation.EQ]: 1, order: 'asc' }, id: { [Operation.EQ]: 1, order: 'asc' } }
    const expectedQuery = 'SELECT * FROM table WHERE status = $1 AND id = $2 ORDER BY status asc,id asc'
    const { query } = getSelectQuery(condition, tableName)
    expect(query).toBe(expectedQuery)
  })

  describe('options', () => {
    it('should return valid query string with raw field selector', () => {
      const options = { rawSelect: 'a, b, c' }
      const expectedQuery = 'SELECT a, b, c FROM table'
      const { query } = getSelectQuery({ }, tableName, options)
      expect(query).toBe(expectedQuery)
    })

    it('should return valid query string with limit', () => {
      const options = { rawSelect: 'a, b, c', limit: 20 }
      const expectedQuery = 'SELECT a, b, c FROM table LIMIT 20'
      const { query } = getSelectQuery({ }, tableName, options)
      expect(query).toBe(expectedQuery)
    })
  })
})
