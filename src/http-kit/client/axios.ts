import { HttpClient, HttpClientOption, ResponseHttp } from '@http-kit/client/interfaces'
import { InternalServerException } from '@http-kit/exception/internal-server'
import { PlainObject } from '@utils/common-types'
import axios, { AxiosInstance } from 'axios'

const ECONNREFUSED_CODE = 'ECONNREFUSED'
const ECONNABORTED_CODE = 'ECONNABORTED'
const INTERNAL_EXCEPTION_CODES = [ ECONNREFUSED_CODE, ECONNABORTED_CODE ]

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

  private getConfig(): Partial<HttpClientOption> {
    return {
      headers: this.headers,
    }
  }

  async get(url: string, query?: PlainObject, option?: HttpClientOption): Promise<ResponseHttp> {
    try {
      const config = this.getConfig()

      if (option?.headers) {
        config.headers = { ...config.headers, ...option.headers }
      }

      if (query) {
        config.params = { ...config.params, ...query }
      }

      const { data, headers, status } = await this.client.get(url, config)

      return { data, headers, status }
    } catch (error) {
      throw INTERNAL_EXCEPTION_CODES.includes(error.code)
        ? new InternalServerException(error.message).withCause(error)
        : error
    }
  }

  async post(url: string, data: PlainObject, option?: HttpClientOption): Promise<ResponseHttp> {
    try {
      const config = this.getConfig()

      if (option?.headers) {
        config.headers = { ...config.headers, ...option.headers }
      }

      const { data: dataResponse, headers, status } = await this.client.post(url, data, config)

      return { data: dataResponse, headers, status }
    } catch (error) {
      throw INTERNAL_EXCEPTION_CODES.includes(error.code)
        ? new InternalServerException(error.message).withCause(error)
        : error
    }
  }

  async put(url: string, data: PlainObject, option?: HttpClientOption): Promise<ResponseHttp> {
    try {
      const config = this.getConfig()

      if (option?.headers) {
        config.headers = { ...config.headers, ...option.headers }
      }

      const { data: dataResponse, headers, status } = await this.client.put(url, data, config)

      return { data: dataResponse, headers, status }
    } catch (error) {
      throw INTERNAL_EXCEPTION_CODES.includes(error.code)
        ? new InternalServerException(error.message).withCause(error)
        : error
    }
  }

  async delete(url: string, payload?: PlainObject, option?: HttpClientOption): Promise<ResponseHttp> {
    try {
      const config = this.getConfig()

      if (option?.headers) {
        config.headers = { ...config.headers, ...option.headers }
      }

      const { data, headers, status } = await this.client.delete(url, { ...config, data: payload })

      return { data, headers, status }
    } catch (error) {
      throw INTERNAL_EXCEPTION_CODES.includes(error.code)
        ? new InternalServerException(error.message).withCause(error)
        : error
    }
  }

  async patch(url: string, data: PlainObject, option?: HttpClientOption): Promise<ResponseHttp> {
    try {
      const config = this.getConfig()

      if (option?.headers) {
        config.headers = { ...config.headers, ...option.headers }
      }

      const { data: dataResponse, headers, status } = await this.client.patch(url, data, config)

      return { data: dataResponse, headers, status }
    } catch (error) {
      throw INTERNAL_EXCEPTION_CODES.includes(error.code)
        ? new InternalServerException(error.message).withCause(error)
        : error
    }
  }
}
