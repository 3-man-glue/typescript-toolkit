import { Handler } from '@http-kit/app/handler/handler'
import { HandlerConstructor } from '@http-kit/app/handler/interfaces'
import { JoiSchemaValidator } from '@http-kit/app/validator/interfaces'
import { JoiValidator } from '@http-kit/app/validator/joi'
import { ContextDto } from '@http-kit/context/interfaces'
import { BadRequestException } from '@http-kit/exception/bad-request'
import { PlainObject } from '@utils/common-types'
import { Service } from 'typedi'

export abstract class RequestValidator<T, K> extends Handler<T, K> {
  protected readonly validator!: JoiValidator

  protected schema!: JoiSchemaValidator

  public handle(): void {
    try {
      this.validator.validate(
        {
          body: this.context.request as PlainObject,
          query: this.context.metadata['reqQuery'] as PlainObject,
          params: this.context.metadata['reqParams'] as PlainObject,
          headers: this.context.metadata['reqHeaders'] as PlainObject,
        },
        this.schema,
      )
    } catch (error) {
      throw new BadRequestException().withCause(error)
    }
  }
}

export const buildRequestValidatorBySchema = (
  schemaValidator: JoiSchemaValidator,
): HandlerConstructor<ContextDto, ContextDto> => {
  @Service({ transient: true })
  class RequestSchemaValidator extends RequestValidator<ContextDto, ContextDto> {
    protected schema = schemaValidator

    protected readonly validator: JoiValidator

    constructor(validator: JoiValidator) {
      super()
      this.validator = validator
    }
  }

  return RequestSchemaValidator
}
