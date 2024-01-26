import Joi from 'joi'
import { JsonSchemaValidator, JoiSchemaValidator } from '@http-kit/app/validator/interfaces'
import { DataValidator } from '@http-kit/app/handler/interfaces'
import { PlainObject } from '@utils/common-types'

const pick = <T, K extends keyof T>(fields: K[], data: T): Partial<T> => {
  const keys = Object.keys(data as PlainObject)

  return keys.reduce((result: Partial<T>, key: string) => {
    if (fields.includes(key as K)) {
      result[ key as K ] = data[ key as K ]
    }

    return result
  }, {})
}

export class JoiValidator implements JsonSchemaValidator {
  validate(data: DataValidator, schema: JoiSchemaValidator): void {
    const validSchema = pick([ 'params', 'query', 'body', 'headers' ], schema)
    const object = pick(Object.keys(validSchema) as (keyof DataValidator)[], data)
    const compiled = Joi.defaults(schema => schema).object(validSchema)
    const { error } = compiled.validate(object)

    if (error) {
      throw error
    }
  }
}
