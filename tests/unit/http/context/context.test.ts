import { getEmptyContext } from '@http-kit/context/context'
import { ContextDto, HttpContext } from '@http-kit/context/interfaces'
import { Anonymous } from '@http-kit/app/identity/anonymous'

describe('Http Context', () => {
  describe('getEmptyContext()', () => {
    it('should return an empty HttpContext', () => {
      const expectedResult = {
        request: {} as ContextDto,
        response: {} as ContextDto,
        status: 0,
        identity: new Anonymous(),
        metadata: {},
      }
      const context: HttpContext<ContextDto, ContextDto> = getEmptyContext()

      expect(context).toStrictEqual(expectedResult)
    })
  })
})
