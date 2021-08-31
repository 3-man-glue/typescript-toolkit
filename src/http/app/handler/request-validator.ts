import { Handler } from '@http/app/handler/handler'
import { HandlerConstructor } from '@http/app/handler/interfaces'
import { JoiSchemaValidator } from '@http/app/validator/interfaces'
import { JoiValidator } from '@http/app/validator/joi'
import { ContextDto } from '@http/context/interfaces'
import { BadRequestException } from '@http/exception/bad-request'
import { PlainObject } from '@utils/common-types'
import { Service } from 'typedi'

export abstract class RequestValidator<T, K> extends Handler<T, K> {
  protected readonly validator!: JoiValidator

  protected schema!: JoiSchemaValidator

  public handle(): void {
    if (
      !this.validator.validate(
        {
          body: this.context.request as PlainObject,
          query: this.context.metadata['reqQuery'] as PlainObject,
          params: this.context.metadata['reqParams'] as PlainObject,
          headers: this.context.metadata['reqHeaders'] as PlainObject,
        },
        this.schema,
      )
    ) {
      throw new BadRequestException()
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
