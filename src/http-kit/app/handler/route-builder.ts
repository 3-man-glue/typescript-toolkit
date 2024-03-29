import path from 'path'
import {
  Api,
  ApiMethod,
  ContextMapper,
  ExceptionResponse,
  HandlerConstructor,
  Middleware,
  RouteBuilder as RouteBuilderInterface
} from '@http-kit/app/handler/interfaces'
import { ContextDto } from '@http-kit/context/interfaces'
import { InternalServerException } from '@http-kit/exception/internal-server'
import { Route } from '@http-kit/app/handler/route'
import { ExceptionInterceptor } from '@http-kit/app/handler/exception'
import { LoggingOptions } from '@utils/logger'

export function Get(api: Api): RouteBuilderInterface {
  return createBaseBuilder(api).setMethod('get')
}

export function Delete(api: Api): RouteBuilderInterface {
  return createBaseBuilder(api).setMethod('delete')
}

export function Post(api: Api): RouteBuilderInterface {
  return createBaseBuilder(api).setMethod('post')
}

export function Patch(api: Api): RouteBuilderInterface {
  return createBaseBuilder(api).setMethod('patch')
}

export function Put(api: Api): RouteBuilderInterface {
  return createBaseBuilder(api).setMethod('put')
}

function createBaseBuilder(api: Api): RouteBuilderInterface {
  const { domain = '', version = '', path: routePath } = api

  return new RouteBuilder().setMethod('get').setPath(path.join('/', domain, version, routePath))
}

class RouteBuilder implements RouteBuilderInterface {
  protected Chain!: HandlerConstructor<ContextDto, ContextDto>[]

  protected path!: string

  #middlewares: Middleware[] = []

  protected method!: ApiMethod

  protected mapper?: ContextMapper

  #ExceptionInterceptor: HandlerConstructor<ContextDto, ExceptionResponse> = ExceptionInterceptor

  #loggingOptions!: LoggingOptions

  public setChain(...HandlerChain: HandlerConstructor<ContextDto, ContextDto>[]): RouteBuilder {
    this.Chain = HandlerChain

    return this
  }

  get middlewares(): Middleware[] {
    return this.#middlewares
  }

  get ExceptionInterceptor(): HandlerConstructor<ContextDto, ExceptionResponse> {
    return this.#ExceptionInterceptor
  }

  public setMiddlewares(...middlewares: Middleware[]): RouteBuilder {
    this.#middlewares = middlewares

    return this
  }

  public setCustomExceptionInterceptor(Interceptor: HandlerConstructor<ContextDto, ExceptionResponse>): RouteBuilder {
    this.#ExceptionInterceptor = Interceptor

    return this
  }

  public setPath(path: string): RouteBuilder {
    this.path = path

    return this
  }

  public setMethod(method: ApiMethod): RouteBuilder {
    this.method = method

    return this
  }

  public setContextMapper(mapper: ContextMapper): RouteBuilder {
    this.mapper = mapper

    return this
  }

  public setLoggingOptions(options: LoggingOptions): RouteBuilder {
    this.#loggingOptions = options

    return this
  }

  public build(): Route {
    const { method, path, mapper, Chain } = this
    if (!(method && path && mapper && Chain && Chain.length)) {
      throw new InternalServerException()
    }

    return new Route({
      method,
      path,
      mapper,
      Chain,
      ExceptionInterceptor: this.#ExceptionInterceptor,
      loggingOptions: this.#loggingOptions,
    })
  }
}
