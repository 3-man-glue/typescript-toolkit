import { Container } from 'typedi'
import {
  ApiMethod,
  ContextMapper,
  HandlerConstructor,
  Route as RouteInterface
} from '@http/app/handler/interfaces'
import { ContextDto, HttpContext } from '@http/context/interfaces'
import { InternalServerException } from '@http/exception/internal-server'

export class Route implements RouteInterface {
  public readonly path: string

  public readonly method: ApiMethod

  public contextMapper: ContextMapper

  protected Handlers: HandlerConstructor<ContextDto, ContextDto>[]

  constructor(
    method: ApiMethod,
    path: string,
    contextMapper: ContextMapper,
    Handlers: HandlerConstructor<ContextDto, ContextDto>[],
  ) {
    this.method = method
    this.path = path
    this.contextMapper = contextMapper
    this.Handlers = Handlers
  }

  public async handle(...args: unknown[]): Promise<HttpContext<ContextDto, ContextDto>> {
    const RootHandler = this.Handlers[0]
    if (!RootHandler) {
      throw new InternalServerException()
    }
    const rootHandler = Container.has(RootHandler) ? Container.get(RootHandler): new RootHandler()
    this.Handlers.slice(1).forEach(Handler => rootHandler.chain(Handler))
    rootHandler.setContext(this.contextMapper(...args))
    await rootHandler.invoke()

    return rootHandler.context
  }
}
