import { HttpException } from './http-exception'

export class ProjectorException extends HttpException {
  constructor(message?: string) {
    const errorMessage = message ?? 'ProjectorException: Something went wrong with Projector'
    super(500, errorMessage, 'ProjectorException')
  }
}
