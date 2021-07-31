import { PlainObject } from '@utils/common-types'
import { Identity } from '@http/identity/interfaces'
import { HttpException } from '@http/exception/http-exception'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextDto {
}

export interface HttpContext<T extends ContextDto, K extends ContextDto> {
  request: T
  response: K
  status: number
  identity: Identity
  exception?: HttpException
  metadata: PlainObject
}
