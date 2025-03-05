/* eslint-disable camelcase */
/// <reference types="node" />
import { HttpClient, ResponseHttp } from '../../http-kit/client/interfaces'
import { ContextDto, HttpContext } from '../../http-kit/context/interfaces'
import { HttpException as HttpExceptionInterface } from '../../http-kit/exception/http-exception'
import { Identity, IdentityObject, PlainObject } from '../../utils/common-types'
import { Logger, LoggingOptions } from '../../utils/logger'
import { Express, NextFunction, Request, Response } from 'express'
import { RequestListener } from 'http'
import { ObjectSchema } from 'joi'
import { ExceptionResponse } from '../../http-kit/app/handler/interfaces'

export declare class HttpServer {
  static create(application: RequestListener, logger: Logger): HttpServer

  setup(config: Partial<HttpServerConfig>): HttpServer

  setLoaderFunction(loader: LoaderFunction): HttpServer

  start(): Promise<void>

  stop(): Promise<void>
}

export declare class PaginationPipe extends Handler<ContextDto, PaginationResponse | ParsedPaginationResponse> {}

export declare class ExceptionInterceptor extends Handler<ContextDto, ExceptionResponse> {}

export interface HttpServerConfig {
  port: number
}
export declare type LoaderFunction = () => Promise<void> | void

export interface IdentityObject {
  id: string
  alias: string
  externalId: string
}
export interface Identity {
  id: string
  alias: string
  externalId?: string
  toJSON(): Readonly<IdentityObject>
  toString(): string
}

export declare class CacheException extends HttpExceptionInterface {
  constructor(message?: string)
}
export declare class DBException extends HttpExceptionInterface {
  constructor(message?: string)
}
export declare class ForbiddenException extends HttpExceptionInterface {
  constructor(message?: string)
}
export declare abstract class HttpException extends Error implements HttpExceptionInterface {
  status: number

  message: string

  code?: string

  input?: PlainObject

  cause?: Error

  constructor(status: number, message: string, code?: string)

  toJSON(): HttpExceptionObject

  toString(): string

  withInput(value: PlainObject): this

  withCause(e: Error): this
}

export declare class IdentityException extends HttpExceptionInterface {
  constructor(message?: string, code?: string)
}

export interface HttpExceptionObject {
  status: number
  message: string
  code?: string
  input?: PlainObject
  cause?: PlainObject
}
export declare class InternalServerException extends HttpExceptionInterface {
  constructor(message?: string)
}
export declare class NotFoundException extends HttpExceptionInterface {
  constructor(message?: string)
}
export declare class ProjectorException extends HttpExceptionInterface {
  constructor(message?: string)
}

export declare class UnauthorizedException extends HttpExceptionInterface {
  constructor(message?: string)
}

export declare class MediaException extends HttpExceptionInterface {
  constructor(message?: string)
}

export declare class NotImplementedException extends HttpExceptionInterface {
  constructor(message?: string)
}

export declare class RemoteStorageException extends HttpExceptionInterface {
  constructor(message?: string)
}
export interface HttpException {
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

export declare class BadRequestException extends HttpExceptionInterface {
  constructor(message?: string)
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextDto {}
export interface HttpContext<T extends ContextDto, K extends ContextDto> {
  request: T
  response: K
  status: number
  identity: Identity
  exception?: HttpExceptionInterface
  metadata: PlainObject
}

export declare function getEmptyContext<T, K>(): HttpContext<T, K>

export declare type ResponseHttp = {
  data: unknown
  headers: PlainObject
  status: number
}
export interface HttpClient {
  setHeaders(headers: PlainObject): this
  get(url: string, query?: PlainObject): Promise<ResponseHttp>
  post(url: string, data: PlainObject): Promise<ResponseHttp>
  put(url: string, data: PlainObject): Promise<ResponseHttp>
  delete(url: string, data: PlainObject): Promise<ResponseHttp>
  patch(url: string, data: PlainObject): Promise<ResponseHttp>
}

export declare class AxiosHttpClient implements HttpClient {
  constructor(baseURL: string, timeout: number, headers: PlainObject)

  setHeaders(headers: PlainObject): this

  get(url: string, query?: PlainObject): Promise<ResponseHttp>

  post(url: string, data: PlainObject): Promise<ResponseHttp>

  put(url: string, data: PlainObject): Promise<ResponseHttp>

  delete(url: string): Promise<ResponseHttp>

  patch(url: string, data: PlainObject): Promise<ResponseHttp>
}

export declare class Actor implements Identity {
  id: string

  alias: string

  externalId?: string

  constructor(id: string, alias: string, externalId?: string)

  toJSON(): Readonly<IdentityObject>

  toString(): string
}

export declare abstract class Controller<T, K> extends Handler<T, K> {
  context: HttpContext<T, K>

  protected get request(): Readonly<T>

  protected set response(value: K)

  protected set status(value: number)

  protected get params(): Readonly<Record<string, unknown>>

  protected get query(): Readonly<Record<string, unknown>>

  protected get headers(): Readonly<Record<string, unknown>>
}

export declare abstract class Handler<T, K> implements Handler<T, K> {
  context: HttpContext<T, K>

  protected NextHandlers: HandlerConstructor<ContextDto, ContextDto>[]

  chain<P, Q>(Handler: HandlerConstructor<P, Q>): this

  invoke(): Promise<void>

  setContext<P, Q>(context: HttpContext<P, Q>): this

  chainMultiple(Handlers: HandlerConstructor<ContextDto, ContextDto>[]): this

  reset(): this
}

export declare type ApiMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'
export interface Handler<T, K> {
  context: HttpContext<T, K>
  invoke(): void | Promise<void>
  chain<P, Q>(Handler: HandlerConstructor<P, Q>): this
  setContext<P, Q>(context: HttpContext<P, Q>): this
  chainMultiple(Handlers: HandlerConstructor<ContextDto, ContextDto>[]): this
  reset(): this
}
export interface Api {
  path: string
  domain?: string
  version?: string
}
export declare type HandlerConstructor<T, K> = new (...args: any[]) => Handler<T, K>
export interface ControllerConstructor<T, K> extends HandlerConstructor<T, K> {
  path: string
  method: ApiMethod
  api: Api
}
export declare type ContextMapper = (...args: any[]) => HttpContext<ContextDto, ContextDto>
export type Middleware = ExpressHandler
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
  build(): Route
  middlewares: Middleware[]
  ExceptionInterceptor: HandlerConstructor<ContextDto, ExceptionResponse>
}

export declare type DataValidator = {
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

export declare abstract class RequestValidator<T, K> extends Handler<T, K> {
  protected readonly validator: JoiValidator

  protected schema: JoiSchemaValidator

  handle(): void
}
export declare const buildRequestValidatorBySchema: (
  schemaValidator: JoiSchemaValidator,
) => HandlerConstructor<ContextDto, ContextDto>

export declare function Get(api: Api): RouteBuilder
export declare function Post(api: Api): RouteBuilder
export declare function Patch(api: Api): RouteBuilder
export declare function Put(api: Api): RouteBuilder
export declare function Delete(api: Api): RouteBuilder

export declare type ConstructorInput = {
  method: ApiMethod
  path: string
  mapper: ContextMapper
  Chain: HandlerConstructor<ContextDto, ContextDto>[]
  ExceptionInterceptor: HandlerConstructor<ContextDto, ExceptionResponse>
}

export declare class Route implements RouteInterface {
  readonly path: string

  readonly method: ApiMethod

  contextMapper: ContextMapper

  protected Handlers: HandlerConstructor<ContextDto, ContextDto>[]

  protected ExceptionInterceptor: HandlerConstructor<ContextDto, ExceptionResponse>

  constructor({ method, path, mapper, Chain, ExceptionInterceptor }: ConstructorInput)

  handle(...args: unknown[]): Promise<HttpContext<ContextDto, ContextDto>>
}

export declare class Anonymous extends Actor {
  constructor()
}

export type FilterFileFunc = (req: Request, file: Express.Multer.File, cb: CallableFunction) => void
export declare class JoiValidator implements JsonSchemaValidator {
  validate(data: DataValidator, schema: JoiSchemaValidator): boolean
}

export interface JsonSchemaValidator {
  validate(data: DataValidator, schema: JoiSchemaValidator): boolean
}
export interface JoiSchemaValidator {
  query?: ObjectSchema<unknown>
  headers?: ObjectSchema<unknown>
  body?: ObjectSchema<unknown>
  params?: ObjectSchema<unknown>
}

export type ExpressHandler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void
export declare class ExpressApp implements HttpApp {
  engine: Express

  static get instance(): ExpressApp

  registerRoute(builder: RouteBuilder): ExpressApp
}
export declare function mapper(req: Request): HttpContext<ContextDto, ContextDto>

export interface HttpApp {
  engine: Readonly<RequestListener>
  registerRoute(builder: RouteBuilder): HttpApp
}

export declare interface ExceptionResponse {
  code?: string
  message: string
}