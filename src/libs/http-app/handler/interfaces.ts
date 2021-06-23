import { HttpContext } from 'libs/http-app/context/interfaces'

export type ApiMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export interface Handler<T, K> {
  context: HttpContext<T, K>

  invoke(): void | Promise<void>

  chain<P, Q>(Handler: HandlerConstructor<P, Q>): this

  setContext<P, Q>(context: HttpContext<P, Q>): this
}

export interface Api {
  path: string
  domain?: string
  version?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HandlerConstructor<T, K> = new (...args: any[]) => Handler<T, K>

export interface ControllerConstructor<T, K> extends HandlerConstructor<T, K>{
  path: string
  method: ApiMethod
  api: Api
}
