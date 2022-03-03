import { HttpException } from '@http-kit/exception/http-exception'

export class NotImplementedException extends HttpException {
  constructor(message?: string) {
    const errorMessage = message ?? 'Feature not implemented'
    super(503, errorMessage, 'NotImplementedException')
  }
}
