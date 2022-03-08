import { HttpException } from '@http-kit/exception/http-exception'

export class UnauthorizedException extends HttpException {
  constructor(message?: string) {
    const errorMessage = message ?? 'Unauthorized: current identity is unauthenticated.'
    super(401, errorMessage, 'UnauthorizedException')
  }
}
