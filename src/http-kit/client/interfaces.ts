import { PlainObject } from '@utils/common-types'

export type ResponseHttp = {
  data: unknown
  headers: PlainObject
  status: number
}

export type HttpClientOption = {
  headers?: PlainObject
  params?: PlainObject
}

export interface HttpClient {
  setHeaders(headers: PlainObject): this
  get(url: string, query?: PlainObject, option?: HttpClientOption): Promise<ResponseHttp>
  post(url: string, data: PlainObject, option?: HttpClientOption): Promise<ResponseHttp>
  put(url: string, data: PlainObject, option?: HttpClientOption): Promise<ResponseHttp>
  delete(url: string, data: PlainObject, option?: HttpClientOption): Promise<ResponseHttp>
  patch(url: string, data: PlainObject, option?: HttpClientOption): Promise<ResponseHttp>
}
