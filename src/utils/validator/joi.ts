import { Service } from 'typedi'
import Joi from 'joi'
import { JsonSchemaValidator, JoiSchemaValidator, DataValidator } from './interfaces'

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
  validate<T extends DataValidator>(data: T, schema: JoiSchemaValidator): boolean {
    const validSchema = pick([ 'params', 'query', 'body' ], schema)
    const object = pick(Object.keys(validSchema) as ( keyof DataValidator )[], data)
    const { error } = Joi.compile(validSchema).validate(object)

    return Boolean(!error)
  }
}
