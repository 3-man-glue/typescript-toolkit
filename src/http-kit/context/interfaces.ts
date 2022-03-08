import { Identity, PlainObject } from '@utils/common-types'
import { HttpException } from '@http-kit/exception/http-exception'

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
