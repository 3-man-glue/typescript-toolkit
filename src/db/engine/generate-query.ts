import { PlainObject } from '@utils/common-types'
import { DBException } from '@http-kit/exception/db'
import { Operation, Condition } from '@db/interfaces'
import { ReturnedQuery } from '@db/engine/interfaces'

export type QueryOptions = {
  allowFiltering?: boolean
  rawSelect?: string
  limit?: number
}

export const CONSTANTS_KEY = {
  ORDER: 'order',
}

export const isNotOrderKey = (key: string): boolean => key !== CONSTANTS_KEY.ORDER
export const isEmptyObject = (payload: PlainObject) => !Object.keys(payload).length

export type OperationStrings = keyof typeof Operation

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

const getUpdateCounterQueryString = (condition: Record<string, unknown>): string => {
  const updateCounterQuery = 'UPDATE counter SET value = value + ?'
  const conditionQueryString = Object.keys(condition)
    .map((key: string) => `${key} = ?`)
    .join(' AND ')

  return `${updateCounterQuery} WHERE ${conditionQueryString}`
}

export const getUpdateCounterQuery = (condition: Record<string, unknown>, changingValue: number): ReturnedQuery => {
  return {
    query: getUpdateCounterQueryString(condition),
    params: Object.values({ changingValue, ...condition }),
  }
}

const getSelectQueryParams = <T extends PlainObject>(condition: T): unknown[] => {
  const values = Object.values(condition) as PlainObject[]

  return values.reduce<unknown[]>((acc: unknown[], value: PlainObject) => {
    const operationKeys = Object.keys(value).filter(isNotOrderKey)
    const params = operationKeys.map((key: string) => value[key])

    return acc.concat(params)
  }, [] as unknown[])
}

export const getSelectQuery = <T>(
  condition: Condition<T>,
  tableName: string,
  options?: QueryOptions,
): ReturnedQuery => {
  return {
    query: getSelectQueryString(condition, tableName, options),
    params: getSelectQueryParams(condition),
  }
}

const getSelectQueryString = <T extends PlainObject>(
  condition: T,
  tableName: string,
  options?: QueryOptions,
): string => {
  const baseQuery = `SELECT ${options?.rawSelect ? options.rawSelect : '*'} FROM ${tableName}`
  const entries = Object.entries(condition) as [string, PlainObject][]

  const orderQuery = entries
    .map(([ key, value ]) => {
      if (!value[CONSTANTS_KEY.ORDER]) {
        return ''
      }

      return `${key} ${value[CONSTANTS_KEY.ORDER]}`
    })
    .filter(Boolean)

  const conditionQuery = entries.reduce((acc: string[], [ key, value ]: [string, PlainObject]) => {
    const operationKeys = Object.keys(value).filter(isNotOrderKey)
    if (!operationKeys.length) {
      return acc
    }

    const queries = operationKeys.map((operationKey: string) => `${key} ${operationKey as OperationStrings} ?`)

    return acc.concat(queries)
  }, [])

  const conditionQueryString = conditionQuery.length ? ` WHERE ${conditionQuery.join(' AND ')}` : ''
  const conditionOrderString = orderQuery.length ? ` ORDER BY ${orderQuery}` : ''
  const conditionLimit = options?.limit ? ` LIMIT ${options.limit}` : ''
  const conditionOptions = options?.allowFiltering ? ' ALLOW FILTERING' : ''

  return `${baseQuery}${conditionQueryString}${conditionOrderString}${conditionOptions}${conditionLimit}`
}
