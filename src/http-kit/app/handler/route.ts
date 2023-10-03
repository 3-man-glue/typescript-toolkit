/* eslint-disable no-return-await */
import {
  ApiMethod,
  ContextMapper,
  ExceptionResponse,
  HandlerConstructor,
  RouteInterface,
} from '@http-kit/app/handler/interfaces'
import { ContextDto, HttpContext } from '@http-kit/context/interfaces'
import { HttpException } from '@http-kit/exception/http-exception'
import { InternalServerException } from '@http-kit/exception/internal-server'
import logger, { LoggingOptions } from '@utils/logger'
import { Container } from 'typedi'
import Timeout = NodeJS.Timeout

type ConstructorInput = {
  method: ApiMethod
  path: string
  mapper: ContextMapper
  Chain: HandlerConstructor<ContextDto, ContextDto>[]
  ExceptionInterceptor: HandlerConstructor<ContextDto, ExceptionResponse>
  loggingOptions?: LoggingOptions
}

export class Route implements RouteInterface {
  public readonly path: string

  public readonly method: ApiMethod

  public contextMapper: ContextMapper

  protected Handlers: HandlerConstructor<ContextDto, ContextDto>[]

  protected ExceptionInterceptor: HandlerConstructor<ContextDto, ExceptionResponse>

  protected loggingOptions: LoggingOptions

  protected logTimeout!: Timeout

  constructor({ method, path, mapper, Chain, ExceptionInterceptor, loggingOptions }: ConstructorInput) {
    this.method = method
    this.path = path
    this.contextMapper = mapper
    this.Handlers = Chain
    this.ExceptionInterceptor = ExceptionInterceptor
    this.loggingOptions = loggingOptions ?? { enable: false }

    if (this.loggingOptions && this.loggingOptions.duration && this.loggingOptions.duration >= 100) {
      this.logTimeout = setTimeout(() => this.disableLogging(), this.loggingOptions.duration)
    }
  }

  public async handle(...args: unknown[]): Promise<HttpContext<ContextDto, ContextDto>> {
    const baseContext = this.contextMapper(...args)
    const RootHandler = this.Handlers[0]
    if (!RootHandler || !this.ExceptionInterceptor) {
      throw new InternalServerException('Route was built without Handler class')
    }
    const rootHandler = Container.has(RootHandler) ? Container.get(RootHandler) : new RootHandler()

    try {
      rootHandler.setContext(baseContext).reset().chainMultiple(this.Handlers.slice(1))
      await rootHandler.invoke()
      this.log('info', { ...rootHandler.context })

      return rootHandler.context
    } catch (e) {
      return await this.handleException(rootHandler.context, e)
    }
  }

  private async handleException(
    context: HttpContext<ContextDto, ContextDto>,
    e: Error,
  ): Promise<HttpContext<ContextDto, ExceptionResponse>> {
    const interceptor = Container.has(this.ExceptionInterceptor)
      ? Container.get(this.ExceptionInterceptor)
      : new this.ExceptionInterceptor()

    interceptor.setContext({
      ...context,
      exception:
        e instanceof HttpException ? e : new InternalServerException(`InternalServerError: ${e.message}`).withCause(e),
    })
    await interceptor.invoke()
    this.log('error', interceptor.context)

    return interceptor.context
  }

  private log(level: 'info' | 'error', context: HttpContext<ContextDto, ContextDto>): void {
    if (this.loggingOptions && this.loggingOptions.enable) {
      logger[level](`${context.status} - ${this.method.toUpperCase()} ${this.path}`, { context })
    }
  }

  private disableLogging(): void {
    this.loggingOptions.enable = false
    clearTimeout(this.logTimeout)
  }
}
