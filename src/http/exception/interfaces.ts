import { PlainObject } from '@utils/common-types'

export interface HttpExceptionObject {
  status: number
  message: string
  code?: string
  input?: PlainObject
  cause?: PlainObject
}

export interface HttpExceptionInterface {
  status: number
  message: string
  code?: string
  input?: PlainObject
  cause?: Error
  toJSON(): HttpExceptionObject
  toString(): string
  withInput(value: PlainObject): this
  withCause(e: Error): this
}
