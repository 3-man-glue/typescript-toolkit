import { HttpContext } from 'libs/http-app/context/interfaces'

export type ApiMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export interface Handler<T, K> {
  context: HttpContext<T, K>
  invoke(): void | Promise<void>
}

export interface Api {
  path: string
  domain?: string
  version?: string
}
