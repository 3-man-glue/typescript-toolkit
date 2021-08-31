import { HttpException } from '@http/exception/http-exception'

export class BadRequestException extends HttpException {
  constructor(message?: string) {
    const errorMessage = message ?? 'Bad Request: Request is invalid formatted.'
    super(400, errorMessage, 'BadRequestException')
  }
}
