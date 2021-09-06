import { PlainObject } from '@utils/common-types'
import { DBException } from '@http/exception/db'
import { Operation, Condition } from '@db/interfaces'
import { ReturnedQuery } from '@db/engine/interfaces'

const CONSTANTS_KEY = {
  ORDER: 'order',
}

const isNotOrderKey = (key: string): boolean => key !== CONSTANTS_KEY.ORDER
const isEmptyObject = (payload: PlainObject) => !Object.keys(payload).length

type OperationStrings = keyof typeof Operation

export const getInsertQueries = (data: PlainObject[], tableName: string): ReturnedQuery[] => {
  if (!data.length || data.every(isEmptyObject)) {
    throw new DBException('Data not provide')
  }

  const baseQuery = `INSERT INTO ${tableName}`

  return data.map((payload: PlainObject) => {
    const fields = Object.keys(payload)
    const payloadLength = Object.keys(payload).length
    const substitutionStrings = Array.from({ length: payloadLength }).fill('?')

    return {
      query: `${baseQuery} (${fields}) VALUES (${substitutionStrings})`,
      params: Object.values(payload),
    }
  })
}

const getSelectQueryParams = <T>(condition:T): unknown[] => {
  return Object.values(condition).map((value: PlainObject) => {
    const operationKey = Object.keys(value).find(isNotOrderKey)
    if (!operationKey) {
      return undefined
    }

    return value[operationKey]
  }).filter(value => (value !== undefined && value !== null))
}

export const getSelectQuery = <T>(condition: Condition<T>, tableName: string): ReturnedQuery => {
  return {
    query: getSelectQueryString(condition, tableName),
    params: getSelectQueryParams(condition),
  }
}

const getSelectQueryString = <T>(condition: T, tableName: string): string => {
  const baseQuery = `SELECT * FROM ${tableName}`

  const orderQuery = Object.entries(condition).map(([ key, value ]) => {
    if (!value[CONSTANTS_KEY.ORDER]) {
      return ''
    }

    return `${key} ${value[CONSTANTS_KEY.ORDER]}`
  }).filter(Boolean)

  const conditionQuery = Object.entries(condition).map(([ key, value ]: [string, PlainObject]) => {
    const operationKey = Object.keys(value).find(isNotOrderKey)
    if (!operationKey) {
      return ''
    }

    return `${key} ${operationKey as OperationStrings} ?`
  }).filter(Boolean)

  const conditionQueryString = conditionQuery.length ? ` WHERE ${conditionQuery.join(' AND ')}` : ''
  const conditionOrderString = orderQuery.length ? ` ORDER BY ${orderQuery}` : ''

  return `${baseQuery}${conditionQueryString}${conditionOrderString}`
}
