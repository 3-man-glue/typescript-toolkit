import { HttpException } from 'libs/http-app/exception/http-exception'

describe('HttpException Abstraction', () => {
  class ConcreteException extends HttpException {
  }

  describe('toJSON() and toString()', () => {
    it('Should return just-valid definition when construct with minimum params', () => {
      const expectedJson = {
        status: 999,
        message: 'error-message',
      }
      const expectedString = '{"status":999,"message":"error-message"}'

      const exceptionUnderTest = new ConcreteException(999, 'error-message')

      expect(exceptionUnderTest.toJSON()).toEqual(expectedJson)
      expect(exceptionUnderTest.toString()).toBe(expectedString)
    })

    it('Should return just-valid definition when construct with all params', () => {
      const expectedJson = {
        status: 999,
        message: 'error-message',
        code: 'error-code',
      }
      const expectedString = '{"status":999,"message":"error-message","code":"error-code"}'

      const exceptionUnderTest = new ConcreteException(999, 'error-message', 'error-code')

      expect(exceptionUnderTest.toJSON()).toEqual(expectedJson)
      expect(exceptionUnderTest.toString()).toBe(expectedString)
    })

    it('Should return just-valid definition when attach standard error cause', () => {
      const expectedJson = {
        status: 999,
        message: 'error-message',
        cause: {
          message: 'error-cause',
          name: 'Error',
        },
      }
      const expectedString = '{"status":999,"message":"error-message","cause":{"message":"error-cause","name":"Error"}}'

      const exceptionUnderTest = new ConcreteException(999, 'error-message')
        .withCause(new Error('error-cause'))

      expect(exceptionUnderTest.toJSON()).toEqual(expectedJson)
      expect(exceptionUnderTest.toString()).toBe(expectedString)
    })

    it('Should return just-valid definition when attach default HttpException cause', () => {
      const expectedJson = {
        status: 999,
        message: 'error-message',
        cause: {
          message: 'error-cause',
          name: 'Error',
        },
      }
      const expectedString = '{"status":999,"message":"error-message","cause":{"message":"error-cause","name":"Error"}}'

      const exceptionUnderTest = new ConcreteException(999, 'error-message')
        .withCause(new ConcreteException(999, 'error-cause'))

      expect(exceptionUnderTest.toJSON()).toEqual(expectedJson)
      expect(exceptionUnderTest.toString()).toBe(expectedString)
    })

    it('Should return just-valid definition when attach error cause with HttpException cause', () => {
      const expectedJson = {
        status: 999,
        message: 'error-message',
        cause: {
          message: 'error-cause',
          name: 'ConcreteException',
        },
      }
      // eslint-disable-next-line max-len
      const expectedString = '{"status":999,"message":"error-message","cause":{"message":"error-cause","name":"ConcreteException"}}'

      const exceptionUnderTest = new ConcreteException(999, 'error-message')
        .withCause(new ConcreteException(999, 'error-cause', 'ConcreteException'))

      expect(exceptionUnderTest.toJSON()).toEqual(expectedJson)
      expect(exceptionUnderTest.toString()).toBe(expectedString)
    })

    it('Should return just-valid definition when attach error input', () => {
      const expectedJson = {
        status: 999,
        message: 'error-message',
        input: {
          string: 'value',
          number: 9999,
          boolean: true,
          object: { key: 'value' },
        },
      }
      // eslint-disable-next-line max-len
      const expectedString = '{"status":999,"message":"error-message","input":{"string":"value","number":9999,"boolean":true,"object":{"key":"value"}}}'

      const exceptionUnderTest = new ConcreteException(999, 'error-message')
        .withInput({ string: 'value', number: 9999, boolean: true, object: { key: 'value' } })

      expect(exceptionUnderTest.toJSON()).toEqual(expectedJson)
      expect(exceptionUnderTest.toString()).toBe(expectedString)
    })
  })
})
