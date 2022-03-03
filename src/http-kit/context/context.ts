import { HttpContext } from './interfaces'
import { Anonymous } from '@http-kit/app/identity/anonymous'

export function getEmptyContext<T, K>(): HttpContext<T, K> {
  return {
    request: {} as T,
    response: {} as K,
    status: 0,
    identity: new Anonymous(),
    metadata: {},
  }
}
