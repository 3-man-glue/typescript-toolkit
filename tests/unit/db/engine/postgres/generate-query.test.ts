import { getSelectQuery, getInsertQueries, getUpdateQueries } from '@db/engine/postgres/generate-query'
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

describe('GetInsertQuery', () => {
  const tableName = 'broadcast'
  it('should throw error when given empty array', () => {
    const expectedError = 'Data not provide'
    expect(() => getInsertQueries([], tableName)).toThrowError(expectedError)
  })

  it('should throw error when given array with empty object', () => {
    const expectedError = 'Data not provide'
    expect(() => getInsertQueries([ {} ], tableName)).toThrowError(expectedError)
  })

  it('should return valid query when given multiple data field', () => {
    const expectedInsertQuery = { query: 'INSERT INTO broadcast (status,segmentId) VALUES ($1,$2)', params: [ 1, 2 ] }

    const insertQuery = getInsertQueries( [ { status: 1, segmentId: 2 } ], tableName)

    expect(insertQuery).toStrictEqual(expectedInsertQuery)
  })

  it('should return valid query when given valid multiple data', () => {
    const expectedQueries = {
      query: 'INSERT INTO broadcast (status) VALUES ($1),($2),($3)',
      params: [ 1, 2, 3 ],
    }

    const insertQueries = getInsertQueries( [ { status: 1 }, { status: 2 }, { status: 3 } ], tableName)

    expect(insertQueries).toStrictEqual(expectedQueries)
  })

  it('should return valid query when two data and field', () => {
    const expectedQueries = {
      query: 'INSERT INTO broadcast (status,segmentId) VALUES ($1,$2),($3,$4)',
      params: [ 1, 2, 1, 2 ],
    }

    const insertQueries = getInsertQueries( [ { status: 1, segmentId: 2 }, { status: 1, segmentId: 2 } ], tableName)

    expect(insertQueries).toStrictEqual(expectedQueries)
  })

  it('should return valid query when given valid multiple data and field', () => {
    const expectedQueries = {
      query: 'INSERT INTO broadcast (status,segmentId,text) VALUES ($1,$2,$3),($4,$5,$6),($7,$8,$9)',
      params: [ 1, 2, 'hi', 1, 2, 'hi', 1, 2, 'hi' ],
    }

    const insertQueries = getInsertQueries(
      [
        { status: 1, segmentId: 2, text: 'hi' },
        { status: 1, segmentId: 2, text: 'hi' },
        { status: 1, segmentId: 2, text: 'hi' },
      ],
      tableName,
    )

    expect(insertQueries).toStrictEqual(expectedQueries)
  })

  it('should throw error when given invalid data formatted', () => {
    const expectedError = 'Data is invalid formatted'
    expect(() => getInsertQueries(
      [ { status: 1, segmentId: 2 }, { status: 1 }, { segmentId: 2 } ], tableName))
      .toThrowError(expectedError)
  })
})

describe('GetUpdateQueries', () => {
  const tableName = 'broadcast'

  it('should return valid query when given valid data', () => {
    const data = [ { status: 1, segmentId: 2 }, { status: 3, segmentId: 4 } ]
    const condition = [ { status: { [Operation.EQ]: 1 }, id: { [Operation.EQ]: 3 } },
      { status: { [Operation.EQ]: 1 }, id: { [Operation.EQ]: 4 } }
    ]
    const expectedQueries = [
      {
        query: 'UPDATE broadcast SET status = $1, segmentId = $2 WHERE status = 1 AND id = 3',
        params: [ 1, 2 ],
      },
      {
        query: 'UPDATE broadcast SET status = $1, segmentId = $2 WHERE status = 1 AND id = 4',
        params: [ 3, 4 ],
      }
    ]

    const updateQueries = getUpdateQueries( data, condition, tableName)

    expect(updateQueries).toStrictEqual(expectedQueries)
  })

  it('should throw error when given invalid data', () => {
    const data = [ { status: { status: 1 }, segmentId: 122 } ]
    const condition = [ { status: { [Operation.EQ]: 1 }, id: { [Operation.EQ]: 3 } } ]
    const expectedError = 'Data is invalid formatted'

    expect(() => getUpdateQueries(data, condition, tableName)).toThrowError(expectedError)
  })

  it('should throw error when given order condition', () => {
    const data = [ { status: 1, segmentId: 122 } ]
    const condition = [ { status: { order: 'asc' } } ]
    const expectedError = 'Data is invalid formatted'

    expect(() => getUpdateQueries(data, condition, tableName)).toThrowError(expectedError)
  })

  it('should throw error when condition length not equal data length', () => {
    const data = [ { status: 1, segmentId: 2 }, { status: 1, segmentId: 2 } ]
    const condition = [ { status: { [Operation.EQ]: 1 }, id: { [Operation.EQ]: 1 } } ]
    const expectedError = 'Data is invalid formatted'

    expect(() => getUpdateQueries(data, condition, tableName)).toThrowError(expectedError)
  })
})
