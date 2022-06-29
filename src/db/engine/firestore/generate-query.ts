import { PlainObject } from '@utils/common-types'
import { OrderPattern, FirestoreConditionPattern } from '@db/interfaces'
import { isNotOrderKey, CONSTANTS_KEY } from '@db/engine/generate-query'

export const getSelectQueryConditions = <T>(condition: T): FirestoreConditionPattern[] => {
  return Object.entries(condition)
    .reduce((acc: PlainObject[], [ key, value ]: [string, PlainObject]) => {
      const operation = Object.keys(value).filter(isNotOrderKey)
      if (!operation.length) {
        return acc
      }
      const queries = operation.map((operationKey: string) => ({
        key,
        operation: operationKey,
        val: value[operationKey],
      }))

      return acc.concat(queries)
    }, []) as FirestoreConditionPattern[]
}

export const getSelectQueryOrders = <T>(condition: T): OrderPattern[] => {
  return Object.entries(condition)
    .map(([ key, value ]) => {
      if (!value[CONSTANTS_KEY.ORDER]) {
        return ''
      }

      return { key, val: value[CONSTANTS_KEY.ORDER] }
    })
    .filter(Boolean) as OrderPattern[]
}
