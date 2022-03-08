import { HttpException } from '@http-kit/exception/http-exception'

export class NotFoundException extends HttpException {
  constructor(message?: string) {
    const errorMessage = message ?? 'Not Found: Request resource not found.'
    super(404, errorMessage, 'NotFoundException')
  }
}
