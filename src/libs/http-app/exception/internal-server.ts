import { HttpException } from './http-exception'

export class InternalServerException extends HttpException {
  constructor(message?: string) {
    const errorMessage = message ?? 'Internal Server Error: unable to identify exception cause'
    super(500, errorMessage, 'InternalServerException')
  }
}
