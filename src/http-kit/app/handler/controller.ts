import { HttpContext } from '@http-kit/context/interfaces'
import { Handler } from './handler'

export abstract class Controller<T, K> extends Handler<T, K> {
  public context!: HttpContext<T, K>

  protected get request(): Readonly<T> {
    return Object.freeze(this.context.request)
  }

  protected set response(value: K) {
    this.context.response = value
  }

  protected set status(value: number) {
    this.context.status = value
  }

  protected get params(): Readonly<Record<string, unknown>> {
    return Object.freeze({ ...(this.context.metadata[ 'reqParams' ] as Record<string, unknown>) })
  }

  protected get query(): Readonly<Record<string, unknown>> {
    return Object.freeze({ ...(this.context.metadata[ 'reqQuery' ] as Record<string, unknown>) })
  }

  protected get headers(): Readonly<Record<string, unknown>> {
    return Object.freeze({ ...(this.context.metadata[ 'reqHeaders' ] as Record<string, unknown>) })
  }
}
