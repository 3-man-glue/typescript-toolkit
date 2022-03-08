import { HttpException } from '@http-kit/exception/http-exception'

export class ForbiddenException extends HttpException {
  constructor(message?: string) {
    const errorMessage = message ?? 'Forbidden: current identity is unauthorized from requesting resource.'
    super(403, errorMessage, 'ForbiddenException')
  }
}
