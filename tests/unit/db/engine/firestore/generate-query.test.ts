import {
  getSelectQueryConditions,
  getSelectQueryOrders
} from '@db/engine/firestore/generate-query'

describe('getSelectQueryConditions', () => {
  it('should return empty condition', () => {
    const conditions = getSelectQueryConditions({})
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
