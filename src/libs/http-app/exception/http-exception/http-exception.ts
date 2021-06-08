import { HttpExceptionObject, HttpException as HttpExceptionInterface } from './interfaces'
import { PlainObject } from 'libs/common-types'

export abstract class HttpException extends Error implements HttpExceptionInterface {
  public status: number
  public message: string
  public code: string | undefined
  public input: PlainObject | undefined = undefined
  public cause: Error | undefined = undefined

  constructor(status: number, message: string, code?: string | undefined) {
    super(message)

    this.status = status
    this.message = message
    this.code = code
  }

  public toJSON(): HttpExceptionObject {
    return {
      status: this.status,
      message: this.message,
      code: this.code,
      input: this.input,
      cause: this.cause,
    }
  }

  public toString(): string {
    return JSON.stringify(this.toJSON())
  }

  public withInput(value: PlainObject): this {
    this.input = value
    return this
  }

  public withCause(e: Error): this {
    this.cause = e
    return this
  }
}
