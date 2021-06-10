import { getEmptyContext } from 'libs/http-app/context/context'
import { ContextDto, HttpContext } from 'libs/http-app/context/interfaces'
import { Anonymous } from 'libs/http-app/identity/anonymous'

describe('Http Context', () => {
  describe('getEmptyContext()', () => {
    it('shuld retun an empty HttpContext', () => {
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
