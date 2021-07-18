import { Service } from 'typedi'
import axios, { AxiosInstance } from 'axios'
import { PlainObject } from 'common-types'
import { HttpClient, ResponseHttp } from '@http/client/interfaces'
import { InternalServerException } from '@http/exception/internal-server'

const ECONNREFUSED_CODE = 'ECONNREFUSED'
const ECONNABORTED_CODE = 'ECONNABORTED'
const INTERNAL_EXCEPTION_CODES = [ ECONNREFUSED_CODE, ECONNABORTED_CODE ]

@Service({ transient: true })
export class AxiosHttpClient implements HttpClient {
  private readonly client: Readonly<AxiosInstance>

  private headers: PlainObject

  constructor(baseURL: string, timeout: number, headers: PlainObject) {
    this.headers = headers
    this.client = axios.create({
      baseURL,
      timeout,
      headers,
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

  async get(url: string, query?: PlainObject): Promise<ResponseHttp> {
    try {
      const params = query || {}
      const { data, headers, status } = await this.client.get(url, this.getConfig(params))

      return { data, headers, status }
    } catch (error) {
      throw INTERNAL_EXCEPTION_CODES.includes(error.code)
        ? new InternalServerException(error.message).withCause(error)
        :error
    }
  }

  async post(url: string, data: PlainObject): Promise<ResponseHttp> {
    try {
      const { data: dataResponse, headers, status } = await this.client.post(url, data, this.getConfig())

      return { data: dataResponse, headers, status }
    } catch (error) {
      throw INTERNAL_EXCEPTION_CODES.includes(error.code)
        ? new InternalServerException(error.message).withCause(error)
        :error
    }
  }

  async put(url: string, data: PlainObject): Promise<ResponseHttp> {
    try {
      const { data: dataResponse, headers, status } = await this.client.put(url, data, this.getConfig())

      return { data: dataResponse, headers, status }
    } catch (error) {
      throw INTERNAL_EXCEPTION_CODES.includes(error.code)
        ? new InternalServerException(error.message).withCause(error)
        :error
    }
  }

  async delete(url: string): Promise<ResponseHttp> {
    try {
      const { data, headers, status } = await this.client.delete(url, this.getConfig())

      return { data, headers, status }
    } catch (error) {
      throw INTERNAL_EXCEPTION_CODES.includes(error.code)
        ? new InternalServerException(error.message).withCause(error)
        :error
    }
  }

  async patch(url: string, data: PlainObject): Promise<ResponseHttp> {
    try {
      const { data: dataResponse, headers, status } = await this.client.patch(url, data, this.getConfig())

      return { data: dataResponse, headers, status }
    } catch (error) {
      throw INTERNAL_EXCEPTION_CODES.includes(error.code)
        ? new InternalServerException(error.message).withCause(error)
        :error
    }
  }
}
