import { HttpExceptionInterface, HttpExceptionObject } from './interfaces'
import { PlainObject } from '@utils/common-types'

export abstract class HttpException extends Error implements HttpExceptionInterface {
  public status: number

  public message: string

  public code?: string

  public input?: PlainObject

  public cause?: Error

  constructor(status: number, message: string, code?: string) {
    super(message)

    this.status = status
    this.message = message
    this.code = code
    this.name = code ?? this.name
  }

  public toJSON(): HttpExceptionObject {
    return {
      status: this.status,
      message: this.message,
      code: this.code,
      input: this.input,
      cause: this.cause
        ? JSON.parse(JSON.stringify(
          { message: this.cause.message, name: this.cause.name, stack: this.cause.stack }, this.removeCircular()
        ))
        : undefined,
    }
  }

  public toString(): string {
    return JSON.stringify(this.toJSON(), this.removeCircular())
  }

  public withInput(value: PlainObject): this {
    this.input = value

    return this
  }

  public withCause(e: Error): this {
    this.cause = e

    return this
  }

  private removeCircular = ()
  : (key: string, value: string | PlainObject) => unknown => {
    const seen = new WeakSet()

    return (_key: string, value: string | PlainObject) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return
        }
        seen.add(value)
      }

      return value
    }
  }
}
