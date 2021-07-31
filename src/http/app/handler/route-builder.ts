import path from 'path'
import {
  Api,
  ApiMethod,
  ContextMapper,
  HandlerConstructor,
  RouteBuilder as RouteBuilderInterface
} from '@http/app/handler/interfaces'
import { ContextDto } from '@http/context/interfaces'
import { InternalServerException } from '@http/exception/internal-server'
import { Route } from '@http/app/handler/route'

export function Get(api: Api): RouteBuilderInterface {
  return createBaseBuilder(api).setMethod('get')
}

export function Post(api: Api): RouteBuilderInterface {
  return createBaseBuilder(api).setMethod('post')
}

function createBaseBuilder(api: Api): RouteBuilderInterface {
  const { domain = 'platform', version = '', path: routePath } = api

  return new RouteBuilder().setMethod('get').setPath(path.join('/', domain, version, routePath))
}

class RouteBuilder implements RouteBuilderInterface {
  protected Chain!: HandlerConstructor<ContextDto, ContextDto>[]

  protected path!: string

  protected method!: ApiMethod

  protected mapper!: ContextMapper

  public setChain(...HandlerChain: HandlerConstructor<ContextDto, ContextDto>[]): RouteBuilder {
    this.Chain = HandlerChain

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

  public build(): Route {
    const { method, path, mapper, Chain } = this
    if (!(method && path && mapper && Chain && Chain.length)) {
      throw new InternalServerException()
    }

    return new Route(method, path, mapper, Chain)
  }
}
