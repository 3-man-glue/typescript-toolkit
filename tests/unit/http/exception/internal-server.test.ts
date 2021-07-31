import { InternalServerException } from '@http/exception/internal-server'
import { HttpException } from '@http/exception/http-exception'

describe('InternalServerException', () => {
  it('Should be implemented properly with default construction', () => {
    const exception = new InternalServerException()

    expect(exception).toBeInstanceOf(HttpException)
    expect(exception).toBeInstanceOf(Error)
    expect(exception.status).toBeGreaterThanOrEqual(500)
    expect(exception.status).toBeLessThanOrEqual(599)
    expect(exception.message).toBe('Internal Server Error: unable to identify exception cause')
    expect(exception.code).toBe('InternalServerException')
  })

  it('Should be implemented properly when construct with message', () => {
    const exception = new InternalServerException('error-message')

    expect(exception).toBeInstanceOf(HttpException)
    expect(exception).toBeInstanceOf(Error)
    expect(exception.status).toBeGreaterThanOrEqual(500)
    expect(exception.status).toBeLessThanOrEqual(599)
    expect(exception.message).toBe('error-message')
    expect(exception.code).toBe('InternalServerException')
  })
})
