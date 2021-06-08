import { PlainObject } from 'libs/common-types'
import { Identity } from 'libs/http-app/identity/interfaces'
import { HttpException } from 'libs/http-app/exception/http-exception'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextDto {
}

export interface HttpContext<T extends ContextDto, K extends ContextDto> {
  request: T
  response: K
  status: number
  identity: Identity
  exception: HttpException
  metadata: PlainObject
}
