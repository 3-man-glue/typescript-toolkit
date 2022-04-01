import 'reflect-metadata'
import { Container, Service } from 'typedi'
import { Handler } from '@http-kit/app/handler/handler'
import { ContextDto } from '@http-kit/context/interfaces'
import { Route } from '@http-kit/app/handler/route'
import { InternalServerException } from '@http-kit/exception/internal-server'
import { getEmptyContext } from '@http-kit/context/context'
import { HandlerConstructor, ExceptionResponse } from '@http-kit/app/handler/interfaces'
import { HttpException } from '@http-kit/exception/http-exception'
import { ExceptionInterceptor } from '@http-kit/app/handler/exception'

jest.mock('@utils/logger', () => ({ error: jest.fn() }))

describe('Route', () => {
  class IndependentHandlerA extends Handler<ContextDto, ContextDto> {
    protected handle(): void {
      this.context.metadata[ 'mutatingKey' ] = 'Value from handler A'
    }
  }

  @Service()
  class DependentHandlerB extends Handler<ContextDto, ContextDto> {
    protected handle(): void {
      this.context.metadata[ 'mutatingKey' ] = 'Value from handler B'
    }
  }

  class Exception extends HttpException {}

  class CrashWithErrorHandler extends Handler<ContextDto, ContextDto> {
    protected handle(): void {
      throw new Error('Crashed with instance of Error')
    }
  }

  class CrashWithExceptionHandler extends Handler<ContextDto, ContextDto> {
    protected handle(): void {
      throw new Exception(999, 'Crashed with instance of Exception', 'MOCKED_ERROR')
    }
  }

  @Service()
  class InjectedExceptionInterceptor extends ExceptionInterceptor {}

  afterEach(() => {
    Container.reset()
    jest.clearAllMocks()
  })

  it('should be defined properly', () => {
    const spyMapper = jest.fn()
    const route = new Route({
      method: 'put',
      path: '/path/to/something',
      mapper: spyMapper,
      Chain: [],
      ExceptionInterceptor: jest.fn(),
    })

    expect(route.method).toBe('put')
    expect(route.path).toBe('/path/to/something')
    expect(route.contextMapper).toStrictEqual(spyMapper)
  })

  describe('handle', () => {
    it('should be able to handle input with single independent handler', async () => {
      const spyMapper = jest.fn().mockReturnValue(getEmptyContext())
      const resultFromHandler = { metadata: { mutatingKey: 'Value from handler A' } }
      const expectedOutput = { ...getEmptyContext(), ...resultFromHandler }

      const route = new Route({
        method: 'put',
        path: '/path/to/something',
        mapper: spyMapper,
        Chain: [ IndependentHandlerA ],
        ExceptionInterceptor: jest.fn(),
      })
      const output = await route.handle('arg1', 'arg2')

      expect(output).toStrictEqual(expectedOutput)
      expect(spyMapper).toHaveBeenCalledTimes(1)
      expect(spyMapper).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should throw error when handle without handler', async () => {
      let isThrown = false
      const spyMapper = jest.fn().mockReturnValue(getEmptyContext())

      try {
        const route = new Route({
          method: 'put',
          path: '/path/to/something',
          mapper: spyMapper,
          Chain: [],
          ExceptionInterceptor: jest.fn(),
        })
        await route.handle('arg1', 'arg2')
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(InternalServerException)
      }

      expect(isThrown).toBeTruthy()
    })

    it('should throw error when handle without exception interceptor', async () => {
      let isThrown = false
      const spyMapper = jest.fn().mockReturnValue(getEmptyContext())

      try {
        const route = new Route({
          method: 'put',
          path: '/path/to/something',
          mapper: spyMapper,
          Chain: [ IndependentHandlerA, CrashWithErrorHandler ],
          ExceptionInterceptor: undefined as unknown as HandlerConstructor<ContextDto, ExceptionResponse>,
        })
        await route.handle('arg1', 'arg2')
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(InternalServerException)
      }

      expect(isThrown).toBeTruthy()
    })

    it('should be able to handle input with single independent handler', async () => {
      const spyMapper = jest.fn().mockReturnValue(getEmptyContext())
      const resultFromHandler = { metadata: { mutatingKey: 'Value from handler B' } }
      const expectedOutput = { ...getEmptyContext(), ...resultFromHandler }

      const route = new Route({
        method: 'put',
        path: '/path/to/something',
        mapper: spyMapper,
        Chain: [ DependentHandlerB ],
        ExceptionInterceptor: jest.fn(),
      })
      const output = await route.handle('arg1', 'arg2')

      expect(output).toStrictEqual(expectedOutput)
      expect(spyMapper).toHaveBeenCalledTimes(1)
      expect(spyMapper).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should be able to handle input with multiple handler and independent as root handler', async () => {
      const spyMapper = jest.fn().mockReturnValue(getEmptyContext())
      const resultLastHandler = { metadata: { mutatingKey: 'Value from handler B' } }
      const expectedOutput = { ...getEmptyContext(), ...resultLastHandler }

      const route = new Route({
        method: 'put',
        path: '/path/to/something',
        mapper: spyMapper,
        Chain: [ IndependentHandlerA, DependentHandlerB ],
        ExceptionInterceptor: jest.fn(),
      })
      const output = await route.handle('arg1', 'arg2')

      expect(output).toStrictEqual(expectedOutput)
      expect(spyMapper).toHaveBeenCalledTimes(1)
      expect(spyMapper).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should be able to handle input with multiple handler and dependent as root handler', async () => {
      const spyMapper = jest.fn().mockReturnValue(getEmptyContext())
      const resultFromLastHandler = { metadata: { mutatingKey: 'Value from handler A' } }
      const expectedOutput = { ...getEmptyContext(), ...resultFromLastHandler }

      const route = new Route({
        method: 'put',
        path: '/path/to/something',
        mapper: spyMapper,
        Chain: [ DependentHandlerB, IndependentHandlerA ],
        ExceptionInterceptor: jest.fn(),
      })
      const output = await route.handle('arg1', 'arg2')

      expect(output).toStrictEqual(expectedOutput)
      expect(spyMapper).toHaveBeenCalledTimes(1)
      expect(spyMapper).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should be able to handle error when handler throw the Error class', async () => {
      const spyMapper = jest.fn().mockReturnValue(getEmptyContext())
      const expectedContext = {
        exception: new InternalServerException('Internal Server Error: unable to identify exception cause')
          .withCause(new Error('Crashed with instance of Error')),
        metadata: {
          mutatingKey: 'Value from handler A',
        },
        response: {
          code: 'InternalServerException',
          message: 'Internal Server Error: unable to identify exception cause',
        },
      }
      const expectedOutput = { ...getEmptyContext(), ...expectedContext }

      const route = new Route({
        method: 'put',
        path: '/path/to/something',
        mapper: spyMapper,
        Chain: [ IndependentHandlerA, CrashWithErrorHandler ],
        ExceptionInterceptor: ExceptionInterceptor,
      })

      const output = await route.handle('arg1', 'arg2')
      expect(output).toStrictEqual(expectedOutput)
      expect(spyMapper).toHaveBeenCalledTimes(1)
      expect(spyMapper).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should be able to handle error when handler throw the HttpException class', async () => {
      const spyMapper = jest.fn().mockReturnValue(getEmptyContext())
      const expectedContext = {
        exception: new Exception(999, 'Crashed with instance of Exception', 'MOCKED_ERROR'),
        metadata: {
          mutatingKey: 'Value from handler A',
        },
        response: {
          code: 'MOCKED_ERROR',
          message: 'Crashed with instance of Exception',
        },
      }
      const expectedOutput = { ...getEmptyContext(), ...expectedContext }

      const route = new Route({
        method: 'put',
        path: '/path/to/something',
        mapper: spyMapper,
        Chain: [ IndependentHandlerA, CrashWithExceptionHandler ],
        ExceptionInterceptor: ExceptionInterceptor,
      })

      const output = await route.handle('arg1', 'arg2')
      expect(output).toStrictEqual(expectedOutput)
      expect(spyMapper).toHaveBeenCalledTimes(1)
      expect(spyMapper).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should be able to handle error with interceptor in IoC when handler throw the HttpException class',
      async () => {
        const spyMapper = jest.fn().mockReturnValue(getEmptyContext())
        const expectedContext = {
          exception: new Exception(999, 'Crashed with instance of Exception', 'MOCKED_ERROR'),
          metadata: {
            mutatingKey: 'Value from handler A',
          },
          response: {
            code: 'MOCKED_ERROR',
            message: 'Crashed with instance of Exception',
          },
        }
        const expectedOutput = { ...getEmptyContext(), ...expectedContext }

        const route = new Route({
          method: 'put',
          path: '/path/to/something',
          mapper: spyMapper,
          Chain: [ IndependentHandlerA, CrashWithExceptionHandler ],
          ExceptionInterceptor: InjectedExceptionInterceptor,
        })

        const output = await route.handle('arg1', 'arg2')
        expect(output).toStrictEqual(expectedOutput)
        expect(spyMapper).toHaveBeenCalledTimes(1)
        expect(spyMapper).toHaveBeenCalledWith('arg1', 'arg2')
      })
  })
})
