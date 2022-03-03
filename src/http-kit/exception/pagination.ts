import { HttpException } from '@http-kit/exception/http-exception'

export class PaginationPipeException extends HttpException {
  constructor(message?: string) {
    const errorMessage = message ?? 'PaginationPipeException: Missing required fields for pagination'
    super(500, errorMessage, 'PaginationPipeException')
  }
}
