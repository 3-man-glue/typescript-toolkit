import { HttpException } from './http-exception'

export class CacheException extends HttpException {
  constructor(message?: string) {
    const errorMessage = message ?? 'CacheException: Something went wrong'
    super(500, errorMessage, 'CacheException')
  }
}
