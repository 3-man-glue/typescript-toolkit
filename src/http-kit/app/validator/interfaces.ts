import { ObjectSchema } from 'joi'
import { DataValidator } from '@http-kit/app/handler/interfaces'

export interface JsonSchemaValidator {
  validate(data: DataValidator, schema: JoiSchemaValidator): void
}

export interface JoiSchemaValidator {
  query?: ObjectSchema<unknown>,
  headers?: ObjectSchema<unknown>,
  body?: ObjectSchema<unknown>,
  params?: ObjectSchema<unknown>,
}
