import { Service } from 'typedi'
import Joi from 'joi'
import { JsonSchemaValidator, JoiSchemaValidator } from '@http-kit/app/validator/interfaces'
import { DataValidator } from '@http-kit/app/handler/interfaces'

const pick = <T, K extends keyof T>(fields: K[], data: T): Partial<T> => {
  return Object.keys(data).reduce((result: Partial<T>, key: string) => {
    if (fields.includes(key as K)) {
      result[key as K] = data[key as K]
    }

    return result
  }, {})
}

@Service()
export class JoiValidator implements JsonSchemaValidator {
  validate(data: DataValidator, schema: JoiSchemaValidator): void {
    const validSchema = pick([ 'params', 'query', 'body', 'headers' ], schema)
    const object = pick(Object.keys(validSchema) as ( keyof DataValidator )[], data)
    const { error } = Joi.compile(validSchema).validate(object)

    if(error) {
      throw error
    }
  }
}
