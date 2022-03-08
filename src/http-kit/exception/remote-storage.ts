import { HttpException } from './http-exception'

export class RemoteStorageException extends HttpException {
  constructor(message?: string) {
    const errorMessage = message ?? 'RemoteStorageException: Something went wrong'
    super(500, errorMessage, 'RemoteStorageException')
  }
}
