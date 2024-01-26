import { PlainObject } from '@utils/common-types'
import { Condition } from '@db/interfaces'
import { ReturnedQuery } from '@db/engine/interfaces'
import { QueryOptions, CONSTANTS_KEY, isNotOrderKey, OperationStrings, isEmptyObject } from '@db/engine/generate-query'
import { DBException } from '@http-kit/exception/db'

const getSelectQueryParams = <T>(condition: T): unknown[] => {
  const values = Object.values(condition as PlainObject) as PlainObject[]

  return values
    .reduce((acc: unknown[], value: PlainObject) => {
      const operationKeys = Object.keys(value).filter(isNotOrderKey)
      const params = operationKeys.map((key: string) => (value[ key ]))

      return acc.concat(params)
    }, [])
}

const getSelectQueryString = <T>(condition: T, tableName: string, options?: QueryOptions): string => {
  const baseQuery = `SELECT ${options?.rawSelect ? options.rawSelect : '*'} FROM ${tableName}`
  const entries = Object.entries(condition as PlainObject) as [string, PlainObject][]

  const orderQuery = entries
    .map(([ key, value ]) => {
      if (!value[CONSTANTS_KEY.ORDER]) {
        return ''
      }

      return `${key} ${value[CONSTANTS_KEY.ORDER]}`
    })
    .filter(Boolean)

  const conditionQuery = entries
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

export const getInsertQueries = (data: PlainObject[], tableName: string): ReturnedQuery => {
  if (!data.length || data.every(isEmptyObject)) {
    throw new DBException('Data not provide')
  }

  const dataKeys = data.map((payload: PlainObject) => {
    return Object.keys(payload)
  })
  const dataValues = data.map((payload: PlainObject) => {
    return Object.values(payload)
  })

  const groupDataKeys = dataKeys.reduce((accValue: string[], currentValue: string[]) => {
    if(accValue.toString() !== currentValue.toString()){
      accValue.push(currentValue.toString())
    }

    return accValue
  }, [])

  if(groupDataKeys.length !== 1){
    throw new DBException('Data is invalid formatted')
  }

  const baseQuery = `INSERT INTO ${tableName} (${groupDataKeys})`
  const substitutionStrings = Array.from({ length: dataKeys.length },
    (_, index) => {
      const values = []
      const len = dataKeys[index]?.length ?? 0
      for (let i = 1; i <= len; i++) {
        values.push(`$${((len*index)+i)}`)
      }

      return `(${values})`
    }
  )

  return {
    query: `${baseQuery} VALUES ${substitutionStrings}`,
    params: dataValues.flat(1),
  }

}

const getUpdateQueryParams = <T>(data: T): unknown[] => {
  const values = Object.values(data as PlainObject) as PlainObject[]

  return values.filter(value => {
    if(typeof(value) === 'object' ){
      throw new DBException('Data is invalid formatted')
    }

    return value
  })

}

const getUpdatetQueryString = <T>(data: PlainObject, condition: T, tableName: string): string => {
  const baseQuery = `UPDATE ${tableName} SET`
  const entries = Object.entries(condition as PlainObject) as [string, PlainObject][]

  const setData = Object.keys(data)
    .map((key, index) => {

      return ` ${key} = $${index+1}`
    })

  const conditionQueryString = entries
    .reduce((acc: string[], [ key, value ]: [string, PlainObject]) => {

      const operationKeys = Object.keys(value).filter(isNotOrderKey)
      if (!operationKeys.length) {
        throw new DBException('Data is invalid formatted')
      }

      const queries = operationKeys.map(
        (operationKey: string) => (`${key} ${operationKey as OperationStrings} ${Object.values(value)}`)
      )

      return acc.concat(queries)
    }, []).join(' AND ')

  return `${baseQuery}${setData} WHERE ${conditionQueryString}`
}

export const getUpdateQueries = <T>(
  data: PlainObject[],
  condition: T[],
  tableName: string,
): ReturnedQuery[] => {
  if (!data.length || data.every(isEmptyObject)) {
    throw new DBException('Data not provide')
  }

  if (data.length !== condition.length){
    throw new DBException('Data is invalid formatted')
  }

  return data.map((payload: PlainObject, index: number) => {
    return {
      query: getUpdatetQueryString(payload, condition[index], tableName),
      params: getUpdateQueryParams(payload),
    }
  })
}
