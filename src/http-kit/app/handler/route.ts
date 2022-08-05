/* eslint-disable no-return-await */
import { Container } from 'typedi'
import {
  ApiMethod,
  ContextMapper,
  ExceptionResponse,
  HandlerConstructor,
  RouteInterface
} from '@http-kit/app/handler/interfaces'
import { ContextDto, HttpContext } from '@http-kit/context/interfaces'
import { InternalServerException } from '@http-kit/exception/internal-server'
import { HttpException } from '@http-kit/exception/http-exception'
import logger from '@utils/logger'

type ConstructorInput = {
  method: ApiMethod,
  path: string,
  mapper: ContextMapper,
  Chain: HandlerConstructor<ContextDto, ContextDto>[],
  ExceptionInterceptor: HandlerConstructor<ContextDto, ExceptionResponse>
}

export class Route implements RouteInterface {
  public readonly path: string

  public readonly method: ApiMethod

  public contextMapper: ContextMapper

  protected Handlers: HandlerConstructor<ContextDto, ContextDto>[]

  protected ExceptionInterceptor: HandlerConstructor<ContextDto, ExceptionResponse>

  constructor({ method, path, mapper, Chain, ExceptionInterceptor }: ConstructorInput) {
    this.method = method
    this.path = path
    this.contextMapper = mapper
    this.Handlers = Chain
    this.ExceptionInterceptor = ExceptionInterceptor
  }

  public async handle(...args: unknown[]): Promise<HttpContext<ContextDto, ContextDto>> {
    const baseContext = this.contextMapper(...args)
    const RootHandler = this.Handlers[0]
    if (!RootHandler || !this.ExceptionInterceptor) {
      throw new InternalServerException('Route was built without Handler class')
    }
    const rootHandler = Container.has(RootHandler) ? Container.get(RootHandler): new RootHandler()
    rootHandler.setContext(baseContext)

    try {
      this.Handlers.slice(1).forEach(Handler => rootHandler.chain(Handler))
      await rootHandler.invoke()
      logger.info(
        `${rootHandler.context.status} - ${this.method.toUpperCase()} ${this.path}`, { context: rootHandler.context }
      )

      return rootHandler.context
    } catch (e) {
      logger.error(
        `${rootHandler.context.status} - ${this.method.toUpperCase()} ${this.path}`, { context: rootHandler.context }
      )

      return await this.handleException(rootHandler.context, e)
    }
  }

  private async handleException(context: HttpContext<ContextDto, ContextDto>, e: Error):
    Promise<HttpContext<ContextDto, ExceptionResponse>> {
    const interceptor = Container.has(this.ExceptionInterceptor)
      ? Container.get(this.ExceptionInterceptor)
      : new this.ExceptionInterceptor()
    interceptor.setContext({
      ...context,
      exception: e instanceof HttpException ? e : new InternalServerException().withCause(e),
    })
    await interceptor.invoke()

    return interceptor.context
  }
}
