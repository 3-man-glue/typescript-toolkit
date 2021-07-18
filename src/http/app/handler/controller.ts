import path from 'path'
import { Api as ApiInterface, ApiMethod } from './interfaces'
import { HttpContext } from '@http/context/interfaces'
import { Handler } from './handler'

export abstract class Controller<T, K> extends Handler<T, K> {
  public static api: ApiInterface

  public static method: ApiMethod

  public context!: HttpContext<T, K>

  static get path(): string {
    const { domain = '', version = '', path: routePath } = this.api

    return path.join('/', domain, version, routePath)
  }

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
