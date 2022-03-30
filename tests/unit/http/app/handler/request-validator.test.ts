import 'reflect-metadata'
import Joi from 'joi'
import Container from 'typedi'
import { Request } from 'express'
import { buildRequestValidatorBySchema } from '@http-kit/app/handler/request-validator'
import { JoiValidator } from '@http-kit/app/validator/joi'
import { mapper } from '@http-kit/app/express'
import { BadRequestException } from '@http-kit/exception/bad-request'

describe('Request Validator', () => {

  it('should not throw an error when request is valid', async () => {
    const schema = {
      body: Joi.object({
        attrA: Joi.string().required(),
      }).required(),
    }
    const body = { attrA: 'testing-a' }
    const context = mapper({ body } as unknown as Request)
    const ValidatorConstructor = buildRequestValidatorBySchema(schema)
    const validator = new ValidatorConstructor(Container.get(JoiValidator))
    validator.setContext(context)

    await expect(validator.invoke()).resolves.not.toThrow()
  })

  it('should throw an error when request is invalid', async () => {
    const schema = {
      body: Joi.object({
        attrA: Joi.string().required(),
      }).required(),
    }
    const body = { others: 'others' }
    const context = mapper({ body } as unknown as Request)
    const ValidatorConstructor = buildRequestValidatorBySchema(schema)
    const validator = new ValidatorConstructor(Container.get(JoiValidator))
    let isThrown = false
    validator.setContext(context)

    try {
      await validator.invoke()
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException)
      expect(error.cause.details[0].message).toEqual('"body.attrA" is required')
      isThrown = true
    }

    expect(isThrown).toBeTruthy()
  })
})
