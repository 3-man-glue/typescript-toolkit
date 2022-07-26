import {
  getSelectQueryConditions,
  getSelectQueryOrders,
  getDocumentIds
} from '@db/engine/firestore/generate-query'
import { DBException } from '@http-kit/exception/db'

describe('getSelectQueryConditions', () => {
  it('should return empty condition', () => {
    const conditions = getSelectQueryConditions({})
    expect(conditions).toStrictEqual([])
  })

  it('should return empty condition when condition is empty', () => {
    const conditions = getSelectQueryConditions({ status: {} })
    expect(conditions).toStrictEqual([])
  })

  it('should return empty condition when set order only', () => {
    const condition = { status: { order: 'asc' } }
    const conditions = getSelectQueryConditions(condition)
    expect(conditions).toStrictEqual([])
  })

  it('should return valid query condition', () => {
    const condition = { status: { ['==']: 1 } }
    const expectedQuery = [ { key: 'status', operation: '==', val: 1 } ]
    const conditions = getSelectQueryConditions(condition)
    expect(conditions).toStrictEqual(expectedQuery)
  })

  it('should return valid multiple query condition', () => {
    const condition = { status: { ['==']: 1 }, id: { in: [ 1, 2, 3 ] } }
    const expectedQuery = [ {
      key: 'status',
      operation: '==',
      val: 1,
    }, {
      key: 'id',
      operation: 'in',
      val: [ 1, 2, 3 ],
    } ]
    const conditions = getSelectQueryConditions(condition)
    expect(conditions).toStrictEqual(expectedQuery)
  })

  it('should not return order when set condition with order', () => {
    const condition = { status: { order: 'asc', ['==']: 1 } }
    const expectedQuery = [ { key: 'status', operation: '==', val: 1 } ]
    const conditions = getSelectQueryConditions(condition)
    expect(conditions).toStrictEqual(expectedQuery)
  })
})

describe('getSelectQueryOrders', () => {
  it('should return empty when no condition', () => {
    const orders = getSelectQueryOrders({})
    expect(orders).toStrictEqual([])
  })

  it('should return empty when condition is empty', () => {
    const conditions = getSelectQueryConditions({ status: {} })
    expect(conditions).toStrictEqual([])
  })

  it('should return empty when order not provide', () => {
    const condition = { status: { ['==']: 1 } }
    const orders = getSelectQueryOrders(condition)
    expect(orders).toStrictEqual([])
  })

  it('should return valid order conditions', () => {
    const condition = { status: { order: 'asc', ['==']: 1 } }
    const expectedOrder = [ { key: 'status', val: 'asc' } ]
    const orders = getSelectQueryOrders(condition)
    expect(orders).toStrictEqual(expectedOrder)
  })
})

describe('getDocumentIds', () => {
  it('should return list of document id', () => {
    const orders = getDocumentIds({ documentId: { ['==']: '1' } })
    expect(orders).toStrictEqual([ '1' ])
  })

  it('should return list of document id where in', () => {
    const orders = getDocumentIds({ documentId: { 'in': [ '1', '2' ] } })
    expect(orders).toStrictEqual([ '1', '2' ])
  })

  it('should throw error when document id not exist', () => {
    const expectedError = new DBException('Document id not provide')
    expect(() => getDocumentIds([ { test: { ['==']: '1' } } ] )).toThrowError(expectedError)
  })
})
