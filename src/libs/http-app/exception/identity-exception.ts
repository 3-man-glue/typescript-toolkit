import { HttpException } from './http-exception'

export class IdentityException extends HttpException {
  constructor(message?: string, code?: string) {
    const errorMessage = message ?? 'Invalid Identity'

    super(500, errorMessage, code)
  }
}
