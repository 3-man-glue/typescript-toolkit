import { HttpException } from '@http-kit/exception/http-exception'
import { IdentityException } from '@http-kit/exception/identity'

describe('IdentityException', () => {
  it('Should be implemented properly with default construction', () => {
    const exception = new IdentityException()

    expect(exception).toBeInstanceOf(HttpException)
    expect(exception).toBeInstanceOf(Error)
    expect(exception.status).toBeGreaterThanOrEqual(500)
    expect(exception.status).toBeLessThanOrEqual(599)
    expect(exception.message).toBe('Invalid Identity')
    expect(exception.code).toBeUndefined()
  })

  it('Should be implemented properly when construct with message', () => {
    const exception = new IdentityException('error-message', 'error-code')

    expect(exception).toBeInstanceOf(HttpException)
    expect(exception).toBeInstanceOf(Error)
    expect(exception.status).toBeGreaterThanOrEqual(500)
    expect(exception.status).toBeLessThanOrEqual(599)
    expect(exception.message).toBe('error-message')
    expect(exception.code).toBe('error-code')
  })
})
