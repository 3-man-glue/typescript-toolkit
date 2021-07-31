import { ObjectSchema } from 'joi'
import { PlainObject } from '../common-types'

export interface JsonSchemaValidator {
  validate<T extends DataValidator>(data: T, schema: JoiSchemaValidator): boolean
}

export interface JoiSchemaValidator {
  query?: ObjectSchema<unknown>,
  body?: ObjectSchema<unknown>,
  params?: ObjectSchema<unknown>,
}

export type DataValidator = {
  params?: PlainObject
  body?: PlainObject
  query?: PlainObject
}
