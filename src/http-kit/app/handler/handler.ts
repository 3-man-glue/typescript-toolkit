import { Container } from 'typedi'
import { HandlerInterface, HandlerConstructor } from './interfaces'
import { ContextDto, HttpContext } from '@http-kit/context/interfaces'

export abstract class Handler<T extends ContextDto, K extends ContextDto> implements HandlerInterface<T, K> {
  context!: HttpContext<T, K>

  protected NextHandlers: HandlerConstructor<ContextDto, ContextDto>[] = []

  public chain<P extends ContextDto, Q extends ContextDto>(Handler: HandlerConstructor<P, Q>): this {
    this.NextHandlers.push(Handler)

    return this
  }

  public async invoke(): Promise<void> {
    try {
      await this.handle()
      await this.next()
    } catch (e) {
      this.context.exception = e
      throw e
    } finally {
      this.NextHandlers.length = 0
    }
  }

  public setContext<P extends ContextDto, Q extends ContextDto>(context: HttpContext<P, Q>): this {
    this.context = {
      ...context,
      request: context.request as ContextDto as T,
      response: context.response as ContextDto as K,
    }

    return this
  }

  protected async next(): Promise<void> {
    for (const NextHandler of this.NextHandlers) {
      const nextHandler = Container.has(NextHandler) ? Container.get(NextHandler) : new NextHandler()
      await nextHandler.setContext(this.context).invoke()
      this.setContext(nextHandler.context)
    }
  }

  protected abstract handle(): void | Promise<void>

  public reset(): this {
    this.NextHandlers.length = 0

    return this
  }

  public chainMultiple(Handlers: HandlerConstructor<ContextDto, ContextDto>[]): this {
    this.NextHandlers = this.NextHandlers.concat(Handlers)

    return this
  }
}
