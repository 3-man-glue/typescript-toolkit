import { Controller } from '@http-kit/app/handler/controller'
import { ContextDto } from '@http-kit/context/interfaces'
import { getEmptyContext } from '@http-kit/context/context'

describe('Controller Abstraction', () => {
  it('Should be able to modify context status', () => {
    class ConcreteController extends Controller<Record<string, never>, ContextDto> {
      protected handle(): void {
        this.status = 999
      }
    }

    const expectedContext = { ...getEmptyContext(), status: 999 }

    const controller = new ConcreteController()
    controller.setContext(getEmptyContext()).invoke()

    expect(controller.context).toStrictEqual(expectedContext)
  })

  it('Should be able to modify response', () => {
    class ConcreteController extends Controller<Record<string, never>, ContextDto> {
      protected handle(): void {
        this.response = { key: 'value' }
      }
    }

    const expectedContext = { ...getEmptyContext(), response: { key: 'value' } }

    const controller = new ConcreteController()
    controller.setContext(getEmptyContext()).invoke()

    expect(controller.context).toStrictEqual(expectedContext)
  })

  it('Should be able to access context request', () => {
    class ConcreteController extends Controller<ContextDto, ContextDto> {
      protected handle(): void {
        this.response = { ...this.request, newKey: true }
      }
    }

    const givenContext = { ...getEmptyContext(), request: { req: 'data', nested: { key: 'value' } } }
    const expectedContext = { ...givenContext, response: { req: 'data', nested: { key: 'value' }, newKey: true } }

    const controller = new ConcreteController()
    controller.setContext(givenContext).invoke()

    expect(controller.context).toStrictEqual(expectedContext)
  })

  describe('Query, params and headers getter', () => {
    class ConcreteController extends Controller<Record<string, never>, ContextDto> {
      protected handle(): void {
        this.response = { query: this.query, params: this.params, headers: this.headers }
      }
    }

    it('should expose access to request query', async () => {
      const metadata = { reqQuery: { k: 'value' } }
      const givenContext = { ...getEmptyContext(), metadata }
      const controller = new ConcreteController()
      const expectedResponse = {
        query: { k: 'value' },
        params: {},
        headers: {},
      }

      await controller.setContext(givenContext).invoke()

      expect(controller.context.response).toStrictEqual(expectedResponse)
    })

    it('should expose access to request params', async () => {
      const metadata = { reqParams: { k: 'value' } }
      const givenContext = { ...getEmptyContext(), metadata }
      const controller = new ConcreteController()
      const expectedResponse = {
        query: {},
        params: { k: 'value' },
        headers: {},
      }

      await controller.setContext(givenContext).invoke()

      expect(controller.context.response).toStrictEqual(expectedResponse)
    })

    it('should expose access to request headers', async () => {
      const metadata = { reqHeaders: { k: 'value' } }
      const givenContext = { ...getEmptyContext(), metadata }
      const controller = new ConcreteController()
      const expectedResponse = {
        query: {},
        params: {},
        headers: { k: 'value' },
      }

      await controller.setContext(givenContext).invoke()

      expect(controller.context.response).toStrictEqual(expectedResponse)
    })
  })
})
