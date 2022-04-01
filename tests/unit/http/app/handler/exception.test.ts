import { ExceptionInterceptor } from '@http-kit/app/handler/exception'
import { getEmptyContext } from '@http-kit/context/context'
import { ContextDto, HttpContext } from '@http-kit/context/interfaces'
import { HttpException } from '@http-kit/exception/http-exception'
import logger from '@utils/logger'

jest.mock('@utils/logger', () => ({ error: jest.fn() }))

describe('Default Exception Interceptor', () => {
  let interceptor: ExceptionInterceptor
  let baseContext: HttpContext<ContextDto, ContextDto>

  class TestException extends HttpException {}

  beforeEach(() => {
    interceptor = new ExceptionInterceptor()
    baseContext = getEmptyContext()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should handle when exception without code is detected in context', async () => {
    const exception = new TestException(999, 'test error')
    const expectedContext = {
      ...baseContext,
      exception,
      response: { message: 'test error' },
    }

    interceptor.setContext({ ...baseContext, exception })
    await interceptor.invoke()

    expect(interceptor.context).toStrictEqual(expectedContext)
    expect(logger.error).toHaveBeenCalledTimes(1)
  })

  it('should handle when exception with code is detected in context', async () => {
    const exception = new TestException(777, 'test error', 'FAKE_CODE')
    const expectedContext = {
      ...baseContext,
      exception,
      response: { message: 'test error', code: 'FAKE_CODE' },
    }

    interceptor.setContext({ ...baseContext, exception })
    await interceptor.invoke()

    expect(interceptor.context).toStrictEqual(expectedContext)
    expect(logger.error).toHaveBeenCalledTimes(1)
  })

  it('should ignore and retain the context when exception not detected in context', async () => {
    const expectedContext = { ...baseContext, request: { k: 'v' }, response: { k: true } }

    interceptor.setContext(expectedContext)
    await interceptor.invoke()

    expect(interceptor.context).toMatchObject(expectedContext)
    expect(logger.error).not.toBeCalled()
  })
})
