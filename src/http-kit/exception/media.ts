
import { HttpException } from '@http-kit/exception/http-exception'

export class MediaException extends HttpException {
  constructor(message?: string, status = 500) {
    const errorMessage = message ?? 'MediaException: Something went wrong with batch'
    super(status, errorMessage, 'MediaException')
  }
}
