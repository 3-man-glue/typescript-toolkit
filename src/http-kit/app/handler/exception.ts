import { Handler } from '@http-kit/app/handler/handler'
import { ExceptionResponse } from '@http-kit/app/handler/interfaces'
import { ContextDto } from '@http-kit/context/interfaces'
import logger from '@utils/logger'

export class ExceptionInterceptor extends Handler<ContextDto, ExceptionResponse> {
  protected handle(): void {
    const exception = this.context.exception
    if (!exception) {
      return
    }

    this.context.response = Object.assign({},
      exception.code ? { code: exception.code } : {},
      { message: exception.message }
    )
    logger.error(exception.message, { e: exception })
  }
}
