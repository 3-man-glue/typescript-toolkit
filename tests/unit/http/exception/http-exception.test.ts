import { HttpException } from '@http-kit/exception/http-exception'

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
          stack: 'test-stack',
        },
      }
      const expectedString = '{"status":999,"message":"error-message",'
        + '"cause":{"message":"error-cause","name":"Error","stack":"test-stack"}}'
      const givenCause = new Error('error-cause')
      givenCause.stack = 'test-stack'

      const exceptionUnderTest = new ConcreteException(999, 'error-message').withCause(givenCause)

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
          stack: 'test-stack',
        },
      }
      const expectedString = '{"status":999,"message":"error-message",'
        + '"cause":{"message":"error-cause","name":"Error","stack":"test-stack"}}'
      const givenError = new ConcreteException(999, 'error-cause')
      givenError.stack = 'test-stack'

      const exceptionUnderTest = new ConcreteException(999, 'error-message').withCause(givenError)

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
          stack: 'test-stack',
        },
      }
      const expectedString = '{"status":999,"message":"error-message",'
        + '"cause":{"message":"error-cause","name":"ConcreteException","stack":"test-stack"}}'
      const givenError = new ConcreteException(999, 'error-cause', 'ConcreteException')
      givenError.stack = 'test-stack'

      const exceptionUnderTest = new ConcreteException(999, 'error-message') .withCause(givenError)

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

      const expectedString = '{"status":999,"message":"error-message",'
      +'"input":{"string":"value","number":9999,"boolean":true,"object":{"key":"value"}}}'

      const exceptionUnderTest = new ConcreteException(999, 'error-message')
        .withInput({ string: 'value', number: 9999, boolean: true, object: { key: 'value' } })

      expect(exceptionUnderTest.toJSON()).toEqual(expectedJson)
      expect(exceptionUnderTest.toString()).toBe(expectedString)
    })

    it('Should return just-valid definition and delete object circular when construct cause with circular', () => {
      const circular = { name: {}, message: {},
        stack: {
          ca: { caa: {} },
          cb: { cba: {} },
          cc: { cca: {} },
          cd: { cda: {} },
          ce: 'value2',
          cf: 'value3',
        },
      }
      circular.name = {
        aa: {
          aaa: 'value1',
        },
      }
      circular.message = circular
      circular.stack.ca.caa = circular.stack.ca
      circular.stack.cb.cba = circular.stack.cb
      circular.stack.cc.cca = circular.stack
      circular.stack.cd.cda = circular.stack.ca.caa
      const expectedCircular = {
        message: {
          name: { aa: { aaa: 'value1' } },
          stack: {
            ca: {},
            cb: {},
            cc: {},
            cd: {},
            ce: 'value2',
            cf: 'value3',
          },
        },
      }
      const expectedJson = {
        status: 999,
        message: 'error-message',
        cause: expectedCircular,
      }

      const expectedString = '{"status":999,"message":"error-message","cause":{'
      +'"message":{"name":{"aa":{"aaa":"value1"}},'
      +'"stack":{"ca":{},"cb":{},"cc":{},"cd":{},"ce":"value2","cf":"value3"}}}}'

      const exceptionUnderTest = new ConcreteException(999, 'error-message')
        .withCause(circular as unknown as Error)

      expect(exceptionUnderTest.toJSON()).toEqual(expectedJson)
      expect(exceptionUnderTest.toString()).toBe(expectedString)

    })

  })
})
