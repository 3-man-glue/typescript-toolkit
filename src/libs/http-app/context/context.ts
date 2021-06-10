import { HttpContext } from './interfaces'
import { Anonymous } from 'libs/http-app/identity/anonymous'

export function getEmptyContext<T, K>(): HttpContext<T, K> {
  return {
    request: {} as T,
    response: {} as K,
    status: 0,
    identity: new Anonymous(),
    metadata: {},
  }
}
