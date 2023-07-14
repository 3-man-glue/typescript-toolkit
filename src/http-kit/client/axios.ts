import { HttpClient, ResponseHttp } from '@http-kit/client/interfaces'
import { InternalServerException } from '@http-kit/exception/internal-server'
import { PlainObject } from '@utils/common-types'
import axios, { AxiosInstance } from 'axios'

const ECONNREFUSED_CODE = 'ECONNREFUSED'
const ECONNABORTED_CODE = 'ECONNABORTED'
const INTERNAL_EXCEPTION_CODES = [ ECONNREFUSED_CODE, ECONNABORTED_CODE ]

type MethodOption = { headers: PlainObject }

type HttpOptions = {
  httpAgent?: unknown
  httpsAgent?: unknown
}

export class AxiosHttpClient implements HttpClient {
  private readonly client: Readonly<AxiosInstance>

  private headers: PlainObject

  constructor(baseURL: string, timeout: number, headers: PlainObject, options?: HttpOptions) {
    this.headers = headers
    this.client = axios.create({
      baseURL,
      timeout,
      headers,
      ...(options ? options : {}),
    })
  }

  setHeaders(headers: PlainObject): this {
    this.headers = { ...this.headers, ...headers }

    return this
  }

  private getConfig(params?: PlainObject) {
    return {
      headers: this.headers,
      params,
    }
  }

  async get(url: string, query?: PlainObject, option?: MethodOption): Promise<ResponseHttp> {
    try {
      if (option?.headers) {
        this.setHeaders(option.headers)
      }

      const params = query || {}
      const { data, headers, status } = await this.client.get(url, this.getConfig(params))

      return { data, headers, status }
    } catch (error) {
      throw INTERNAL_EXCEPTION_CODES.includes(error.code)
        ? new InternalServerException(error.message).withCause(error)
        : error
    }
  }

  async post(url: string, data: PlainObject, option?: MethodOption): Promise<ResponseHttp> {
    try {
      if (option?.headers) {
        this.setHeaders(option.headers)
      }

      const { data: dataResponse, headers, status } = await this.client.post(url, data, this.getConfig())

      return { data: dataResponse, headers, status }
    } catch (error) {
      throw INTERNAL_EXCEPTION_CODES.includes(error.code)
        ? new InternalServerException(error.message).withCause(error)
        : error
    }
  }

  async put(url: string, data: PlainObject): Promise<ResponseHttp> {
    try {
      const { data: dataResponse, headers, status } = await this.client.put(url, data, this.getConfig())

      return { data: dataResponse, headers, status }
    } catch (error) {
      throw INTERNAL_EXCEPTION_CODES.includes(error.code)
        ? new InternalServerException(error.message).withCause(error)
        : error
    }
  }

  async delete(url: string, payload?: PlainObject): Promise<ResponseHttp> {
    try {
      const { data, headers, status } = await this.client.delete(url, { ...this.getConfig(), data: payload })

      return { data, headers, status }
    } catch (error) {
      throw INTERNAL_EXCEPTION_CODES.includes(error.code)
        ? new InternalServerException(error.message).withCause(error)
        : error
    }
  }

  async patch(url: string, data: PlainObject): Promise<ResponseHttp> {
    try {
      const { data: dataResponse, headers, status } = await this.client.patch(url, data, this.getConfig())

      return { data: dataResponse, headers, status }
    } catch (error) {
      throw INTERNAL_EXCEPTION_CODES.includes(error.code)
        ? new InternalServerException(error.message).withCause(error)
        : error
    }
  }
}
