import { PlainObject } from '@utils/common-types'
import { OrderPattern, FirestoreConditionPattern, FirestoreOperation } from '@db/interfaces'
import { isNotOrderKey, CONSTANTS_KEY } from '@db/engine/generate-query'
import { DBException } from '@http-kit/exception/db'

export const FIREBASE_CONSTANTS_KEY = {
  DOCUMENT_ID: 'documentId',
}

export const getSelectQueryConditions = <T>(condition: T): FirestoreConditionPattern[] => {
  const entries = Object.entries(condition as PlainObject) as [string, PlainObject][]

  return entries.reduce((acc: PlainObject[], [ key, value ]: [string, PlainObject]) => {
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
  const entries = Object.entries(condition as PlainObject) as [string, PlainObject][]

  return entries
    .map(([ key, value ]) => {
      if (!value[CONSTANTS_KEY.ORDER]) {
        return ''
      }

      return { key, val: value[CONSTANTS_KEY.ORDER] }
    })
    .filter(Boolean) as OrderPattern[]
}

export const getDocumentIds = <T>(condition: T): string[] => {
  const entries = Object.entries(condition as PlainObject) as [string, PlainObject][]

  const documentIds = entries
    .map(([ key, value ]) => {
      if (key === FIREBASE_CONSTANTS_KEY.DOCUMENT_ID) {
        return value[FirestoreOperation.EQ] ?? value[FirestoreOperation.IN]
      }

      return ''
    })
    .filter(Boolean)

  if (!documentIds.length) {
    throw new DBException('Document id not provide')
  }

  return documentIds.flat() as string[]
}
