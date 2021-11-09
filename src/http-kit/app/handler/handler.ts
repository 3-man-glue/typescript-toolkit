import { Container } from 'typedi'
import { HandlerInterface, HandlerConstructor } from './interfaces'
import { ContextDto, HttpContext } from '@http-kit/context/interfaces'

export abstract class Handler<T, K> implements HandlerInterface<T, K> {
  context!: HttpContext<T, K>

  protected NextHandlers: HandlerConstructor<ContextDto, ContextDto>[] = []

  public chain<P, Q>(Handler: HandlerConstructor<P, Q>): this {
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
    }
  }

  public setContext<P, Q>(context: HttpContext<P, Q>): this {
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
    this.NextHandlers.length = 0
  }

  protected abstract handle(): void | Promise<void>
}
