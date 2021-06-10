import { ContextDto, HttpContext } from 'libs/http-app/context/interfaces'
import { getEmptyContext } from 'libs/http-app/context/http-context'
import { Api as ApiInterface, ApiMethod, Handler } from './interfaces'
import path from 'path'

export abstract class Controller<T, K> implements Handler<T, K>{
  public static api: ApiInterface
  public static method: ApiMethod
  public context: HttpContext<T, K> = getEmptyContext()

  static get path(): string {
    const { domain = '', version = '', path: routePath } = this.api

    return path.join('/', domain, version, routePath)
  }

  public abstract invoke(): void | Promise<void>

  get request(): T {
    return this.context.request
  }

  set response(value: K) {
    this.context.response = value
  }

  set status(value: number) {
    this.context.status = value
  }
}

export interface ControllerConstructor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new(...args: any[]): Controller<ContextDto, ContextDto>
  path: string
  method: ApiMethod
  api: ApiInterface
}
