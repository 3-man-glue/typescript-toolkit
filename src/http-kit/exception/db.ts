import { HttpException } from './http-exception'

export class DBException extends HttpException {
  constructor(message?: string) {
    const errorMessage = message ?? 'DBException: Something went wrong with DB'
    super(500, errorMessage, 'DBException')
  }
}
