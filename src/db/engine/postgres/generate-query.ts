import { PlainObject } from '@utils/common-types'
import { Condition } from '@db/interfaces'
import { ReturnedQuery } from '@db/engine/interfaces'
import { QueryOptions, CONSTANTS_KEY, isNotOrderKey, OperationStrings } from '@db/engine/generate-query'

const getSelectQueryParams = <T>(condition: T): unknown[] => {
  return Object.values(condition)
    .reduce((acc: unknown[], value: PlainObject) => {
      const operationKeys = Object.keys(value).filter(isNotOrderKey)
      const params = operationKeys.map((key: string) => (value[ key ]))

      return acc.concat(params)
    }, [])
}

const getSelectQueryString = <T>(condition: T, tableName: string, options?: QueryOptions): string => {
  const baseQuery = `SELECT ${options?.rawSelect ? options.rawSelect : '*'} FROM ${tableName}`

  const orderQuery = Object.entries(condition)
    .map(([ key, value ]) => {
      if (!value[CONSTANTS_KEY.ORDER]) {
        return ''
      }

      return `${key} ${value[CONSTANTS_KEY.ORDER]}`
    })
    .filter(Boolean)

  const conditionQuery = Object.entries(condition)
    .reduce((acc: string[], [ key, value ]: [string, PlainObject]) => {
      const operationKeys = Object.keys(value).filter(isNotOrderKey)
      if (!operationKeys.length) {
        return acc
      }

      const queries = operationKeys.map(
        (operationKey: string) => (`${key} ${operationKey as OperationStrings} $${acc.length + 1}`)
      )

      return acc.concat(queries)
    }, [])

  const conditionQueryString = conditionQuery.length ? ` WHERE ${conditionQuery.join(' AND ')}` : ''
  const conditionOrderString = orderQuery.length ? ` ORDER BY ${orderQuery}` : ''
  const conditionLimit = options?.limit ? ` LIMIT ${options.limit}` : ''

  return `${baseQuery}${conditionQueryString}${conditionOrderString}${conditionLimit}`
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
