import { DataValidator } from '@http/app/handler/interfaces'
import { ObjectSchema } from 'joi'

export interface JsonSchemaValidator {
  validate(data: DataValidator, schema: JoiSchemaValidator): boolean
}

export interface JoiSchemaValidator {
  query?: ObjectSchema<unknown>,
  headers?: ObjectSchema<unknown>,
  body?: ObjectSchema<unknown>,
  params?: ObjectSchema<unknown>,
}
