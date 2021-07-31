import 'reflect-metadata'
import { Container, Service } from 'typedi'
import { Handler } from '@http/app/handler/handler'
import { ContextDto, HttpContext } from '@http/context/interfaces'
import { getEmptyContext } from '@http/context/context'
import { Actor } from '@http/identity/actor'
import { Anonymous } from '@http/identity/anonymous'

describe('Handler Abstraction', () => {
  class IndependentHandlerA extends Handler<ContextDto, ContextDto> {
    protected handle(): void {
      this.context.metadata[ 'mutatingKey' ] = 'Value from handler A'
      this.context.metadata[ 'handlerA' ] = 'Value from handler A'
      this.testAppendOrderOfHandler()
    }

    private testAppendOrderOfHandler(): void {
      this.context.metadata[ 'order' ] = [ ...(this.context.metadata[ 'order' ] ?? []) as Iterable<string>, 'A' ]
    }
  }

  @Service()
  class DependentHandlerB extends Handler<ContextDto, ContextDto> {
    protected handle(): void {
      this.context.metadata[ 'mutatingKey' ] = 'Value from handler B'
      this.context.metadata[ 'handlerB' ] = 'Value from handler B'
      this.context.status = 800
      this.context.response = { key: 'response', mutated: true }
      this.context.request = { key: 'request', mutated: true }
      this.context.identity = new Actor('user-id', 'alias')
      this.testAppendOrderOfHandler()
    }

    private testAppendOrderOfHandler(): void {
      this.context.metadata[ 'order' ] = [ ...(this.context.metadata[ 'order' ] ?? []) as Iterable<string>, 'B' ]
    }
  }

  class IndependentHandlerC extends Handler<ContextDto, ContextDto> {
    protected handle(): void {
      this.context.metadata[ 'mutatingKey' ] = 'Value from handler C'
      this.context.metadata[ 'handlerC' ] = 'Value from handler C'
      this.context.status = 900
      this.testAppendOrderOfHandler()
    }

    private testAppendOrderOfHandler(): void {
      this.context.metadata[ 'order' ] = [ ...(this.context.metadata[ 'order' ] ?? []) as Iterable<string>, 'C' ]
    }
  }

  @Service()
  class DependentHandlerD extends Handler<ContextDto, ContextDto> {
    protected handle(): void {
      this.testAppendOrderOfHandler()
      this.chain(NestedHandler)
    }

    private testAppendOrderOfHandler(): void {
      this.context.metadata[ 'order' ] = [ ...(this.context.metadata[ 'order' ] ?? []) as Iterable<string>, 'D' ]
    }
  }

  class NestedHandler extends Handler<ContextDto, ContextDto> {
    protected handle(): void {
      this.context.metadata[ 'mutatingKey' ] = 'Value from nested Handler'
      this.context.metadata[ 'nestedHandler' ] = 'Value from nested Handler'
      this.context.status = 200
      this.testAppendOrderOfHandler()
    }

    private testAppendOrderOfHandler(): void {
      this.context.metadata[ 'order' ] = [ ...(this.context.metadata[ 'order' ] ?? []) as Iterable<string>, 'Nested' ]
    }
  }

  describe('Constructor', () => {
    it('Should have context undefined', () => {
      const handler = new IndependentHandlerA()

      expect(handler.context).toBeUndefined()
    })
  })

  describe('setContext()', () => {
    it('Should set the context with the input', () => {
      const context: HttpContext<ContextDto, ContextDto> = {
        request: {},
        response: {},
        identity: new Anonymous(),
        metadata: { key: 'value' },
        status: 999,
      }

      const handlerA = new IndependentHandlerA().setContext(context)

      expect(handlerA.context).toStrictEqual(context)
    })

    it('Should be able to forward its context from Handler A to B', () => {
      const handlerA = new IndependentHandlerA().setContext({
        request: { in: 'data-in' },
        response: { out: 12345 },
        identity: new Anonymous(),
        metadata: { key: 'value' },
        status: 999,
      })

      const handlerB = new DependentHandlerB().setContext(handlerA.context)

      expect(handlerB.context).toStrictEqual(handlerA.context)
    })

    it('Should set the context to the last input', () => {
      const context: HttpContext<ContextDto, ContextDto> = {
        request: {},
        response: {},
        identity: new Anonymous(),
        metadata: { key: 'value' },
        status: 999,
      }

      const handlerA = new IndependentHandlerA()
        .setContext(context)
        .setContext(getEmptyContext())

      expect(handlerA.context).toStrictEqual(getEmptyContext())
    })
  })

  describe('invoke()', () => {
    it('Should throw when invoke with context undefined', async () => {
      try {
        await new IndependentHandlerA().invoke()
      } catch (e) {
        expect(e).toBeInstanceOf(TypeError)
      }

      expect.assertions(1)
    })

    it('Should be able to work with its context', async () => {
      const handler = new DependentHandlerB().setContext(getEmptyContext())
      const expectedContext = {
        status: 800,
        request: { key: 'request', mutated: true },
        response: { key: 'response', mutated: true },
        identity: new Actor('user-id', 'alias'),
        metadata: {
          mutatingKey: 'Value from handler B',
          handlerB: 'Value from handler B',
          order: [ 'B' ],
        },
      }

      await handler.invoke()

      expect(handler.context).toStrictEqual(expectedContext)
    })
  })

  describe('chain()', () => {
    it('Should chain the invocation from handler A to B', async () => {
      const expectedContext = {
        identity: new Actor('user-id', 'alias'),
        metadata: {
          mutatingKey: 'Value from handler B',
          handlerA: 'Value from handler A',
          handlerB: 'Value from handler B',
          order: [ 'A', 'B' ],
        },
        request: { key: 'request', mutated: true },
        response: { key: 'response', mutated: true },
        status: 800,
      }
      const handler = new IndependentHandlerA()

      await handler.setContext(getEmptyContext())
        .chain(DependentHandlerB)
        .invoke()

      expect(handler.context).toStrictEqual(expectedContext)
    })

    it('Should chain the invocation from handler C to A to B', async () => {
      const expectedContext = {
        identity: new Actor('user-id', 'alias'),
        metadata: {
          mutatingKey: 'Value from handler B',
          handlerA: 'Value from handler A',
          handlerB: 'Value from handler B',
          handlerC: 'Value from handler C',
          order: [ 'C', 'A', 'B' ],
        },
        request: { key: 'request', mutated: true },
        response: { key: 'response', mutated: true },
        status: 800,
      }

      const handler = new IndependentHandlerC()
      await handler.setContext(getEmptyContext())
        .chain(IndependentHandlerA)
        .chain(DependentHandlerB)
        .invoke()

      expect(handler.context).toStrictEqual(expectedContext)
    })

    it('Should chain the invocation from handler A to D to Nested of D', async () => {
      const expectedContext = {
        identity: new Anonymous(),
        metadata: {
          mutatingKey: 'Value from nested Handler',
          handlerA: 'Value from handler A',
          nestedHandler: 'Value from nested Handler',
          order: [ 'A', 'D', 'Nested' ],
        },
        request: {},
        response: {},
        status: 200,
      }
      const handler = new IndependentHandlerA()

      await handler.setContext(getEmptyContext())
        .chain(DependentHandlerD)
        .invoke()

      expect(handler.context).toStrictEqual(expectedContext)
    })

    it('Should chain the invocation from handler C to D to Stateful Nested of D to A to B', async () => {
      const expectedContext = {
        identity: new Actor('user-id', 'alias'),
        metadata: {
          mutatingKey: 'Value from handler B',
          handlerA: 'Value from handler A',
          handlerB: 'Value from handler B',
          handlerC: 'Value from handler C',
          nestedHandler: 'Value from nested Handler',
          order: [ 'C', 'D', 'Nested', 'A', 'B' ],
        },
        request: { key: 'request', mutated: true },
        response: { key: 'response', mutated: true },
        status: 800,
      }

      const handler = new IndependentHandlerC()
      await handler.setContext(getEmptyContext())
        .chain(DependentHandlerD)
        .chain(IndependentHandlerA)
        .chain(DependentHandlerB)
        .invoke()

      expect(handler.context).toStrictEqual(expectedContext)
    })

    it('Should chain the invocation from handler C to D to Reset Nested of D to A to B', async () => {
      const expectedContext = {
        identity: new Actor('user-id', 'alias'),
        metadata: {
          mutatingKey: 'Value from handler B',
          handlerA: 'Value from handler A',
          handlerB: 'Value from handler B',
          handlerC: 'Value from handler C',
          nestedHandler: 'Value from nested Handler',
          order: [ 'C', 'D', 'Nested', 'A', 'B' ],
        },
        request: { key: 'request', mutated: true },
        response: { key: 'response', mutated: true },
        status: 800,
      }

      Container.reset()
      const handler = new IndependentHandlerC()
      await handler.setContext(getEmptyContext())
        .chain(DependentHandlerD)
        .chain(IndependentHandlerA)
        .chain(DependentHandlerB)
        .invoke()

      expect(handler.context).toStrictEqual(expectedContext)
    })
  })
})
