import { getEmptyContext } from '@http/context/context'
import { ContextDto, HttpContext } from '@http/context/interfaces'
import { Anonymous } from '@http/identity/anonymous'

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
