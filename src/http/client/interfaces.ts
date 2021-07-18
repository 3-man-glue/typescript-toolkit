import { PlainObject } from 'common-types'

export type ResponseHttp = {
  data: PlainObject
  headers: PlainObject
  status: number
}

export interface HttpClient {
  setHeaders(headers: PlainObject): this
  get(url: string, query?: PlainObject): Promise<ResponseHttp>
  post(url: string, data: PlainObject): Promise<ResponseHttp>
  put(url: string, data: PlainObject): Promise<ResponseHttp>
  delete(url: string, data: PlainObject): Promise<ResponseHttp>
  patch(url: string, data: PlainObject): Promise<ResponseHttp>
}
