/* eslint-disable camelcase */
import { ContextDto, HttpContext } from '@http-kit/context/interfaces'
import { ExpressHandler } from '@http-kit/app/express'
import { PlainObject } from '@utils/common-types'
import { LoggingOptions } from '@utils/logger'

export type ApiMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export interface HandlerInterface<T, K> {
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
export type HandlerConstructor<T, K> = new (...args: any[]) => HandlerInterface<T, K>

export interface ControllerConstructor<T, K> extends HandlerConstructor<T, K> {
  path: string
  method: ApiMethod
  api: Api
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContextMapper = (...args: any[]) => HttpContext<ContextDto, ContextDto>

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Middleware extends ExpressHandler {}
export interface RouteInterface {
  path: string

  method: ApiMethod

  contextMapper: ContextMapper

  handle(...args: unknown[]): Promise<HttpContext<ContextDto, ContextDto>>
}

export interface RouteBuilder {
  setContextMapper(mapper: ContextMapper): RouteBuilder

  setMethod(method: ApiMethod): RouteBuilder

  setMiddlewares(...middlewares: Middleware[]): RouteBuilder

  setCustomExceptionInterceptor(interceptor: HandlerConstructor<ContextDto, ExceptionResponse>): RouteBuilder

  setPath(path: string): RouteBuilder

  setChain(...HandlerChain: HandlerConstructor<ContextDto, ContextDto>[]): RouteBuilder

  setLoggingOptions(options: LoggingOptions): RouteBuilder

  build(): RouteInterface

  middlewares: Middleware[]

  ExceptionInterceptor: HandlerConstructor<ContextDto, ExceptionResponse>
}

export type DataValidator = {
  params: PlainObject
  body: PlainObject
  query: PlainObject
  headers: PlainObject
}

export interface ParsedPaginationResponse {
  limit: number
  total: number
  current_page: number
  items: PlainObject[]
  filters?: PlainObject | null
}

export interface PaginationResponse<T = PlainObject> {
  result: T[]
  page: {
    total: number
    current: number
    size: number
  }
  filters?: PlainObject
}

export interface ExceptionResponse {
  code?: string
  message: string
}
