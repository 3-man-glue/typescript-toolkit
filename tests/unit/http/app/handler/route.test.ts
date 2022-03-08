import 'reflect-metadata'
import { Container, Service } from 'typedi'
import { Handler } from '@http-kit/app/handler/handler'
import { ContextDto } from '@http-kit/context/interfaces'
import { Route } from '@http-kit/app/handler/route'
import { InternalServerException } from '@http-kit/exception/internal-server'
import { getEmptyContext } from '@http-kit/context/context'

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

  afterEach(() => {
    Container.reset()
    jest.clearAllMocks()
  })

  it('Should be defined properly', () => {
    const spyMapper = jest.fn()
    const route = new Route('put', '/path/to/something', spyMapper, [])

    expect(route.method).toBe('put')
    expect(route.path).toBe('/path/to/something')
    expect(route.contextMapper).toStrictEqual(spyMapper)
  })

  describe('handle', () => {
    it('Should throw error when handle without handler', async () => {
      let isThrown = false
      const route = new Route('put', '/path/to/something', jest.fn(), [])

      try {
        await route.handle()
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(InternalServerException)
      }

      expect(isThrown).toBeTruthy()
    })

    it('Should be able to handle input with single independent handler', async () => {
      const spyMapper = jest.fn().mockReturnValue(getEmptyContext())
      const resultFromHandler = { metadata: { mutatingKey: 'Value from handler A' } }
      const expectedOutput = { ...getEmptyContext(), ...resultFromHandler }

      const route = new Route('put', '/path/to/something', spyMapper, [ IndependentHandlerA ])
      const output = await route.handle('arg1', 'arg2')

      expect(output).toStrictEqual(expectedOutput)
      expect(spyMapper).toHaveBeenCalledTimes(1)
      expect(spyMapper).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('Should throw error when no handler', async () => {
      let isThrown = false
      const spyMapper = jest.fn().mockReturnValue(getEmptyContext())

      try {
        const route = new Route('put', '/path/to/something', spyMapper, [])
        await route.handle('arg1', 'arg2')
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(InternalServerException)
      }

      expect(isThrown).toBeTruthy()
    })

    it('Should be able to handle input with single independent handler', async () => {
      const spyMapper = jest.fn().mockReturnValue(getEmptyContext())
      const resultFromHandler = { metadata: { mutatingKey: 'Value from handler B' } }
      const expectedOutput = { ...getEmptyContext(), ...resultFromHandler }

      const route = new Route('put', '/path/to/something', spyMapper, [ DependentHandlerB ])
      const output = await route.handle('arg1', 'arg2')

      expect(output).toStrictEqual(expectedOutput)
      expect(spyMapper).toHaveBeenCalledTimes(1)
      expect(spyMapper).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('Should be able to handle input with multiple handler and independent as root handler', async () => {
      const spyMapper = jest.fn().mockReturnValue(getEmptyContext())
      const resultLastHandler = { metadata: { mutatingKey: 'Value from handler B' } }
      const expectedOutput = { ...getEmptyContext(), ...resultLastHandler }

      const route = new Route('put', '/path/to/something', spyMapper, [ IndependentHandlerA, DependentHandlerB ])
      const output = await route.handle('arg1', 'arg2')

      expect(output).toStrictEqual(expectedOutput)
      expect(spyMapper).toHaveBeenCalledTimes(1)
      expect(spyMapper).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('Should be able to handle input with multiple handler and dependent as root handler', async () => {
      const spyMapper = jest.fn().mockReturnValue(getEmptyContext())
      const resultFromLastHandler = { metadata: { mutatingKey: 'Value from handler A' } }
      const expectedOutput = { ...getEmptyContext(), ...resultFromLastHandler }

      const route = new Route('put', '/path/to/something', spyMapper, [ DependentHandlerB, IndependentHandlerA ])
      const output = await route.handle('arg1', 'arg2')

      expect(output).toStrictEqual(expectedOutput)
      expect(spyMapper).toHaveBeenCalledTimes(1)
      expect(spyMapper).toHaveBeenCalledWith('arg1', 'arg2')
    })
  })
})
