import { DomainState, EventContext } from '@ddd/interfaces'
import { DomainEvent } from '@ddd/event'
import { DomainEventEmitter } from '@ddd/event-emitter'
import { Anonymous } from '@http-kit/identity/anonymous'

jest.mock('@utils/id-generator', () => ({
  cuid: jest.fn().mockReturnValue('test'),
}))

interface TestState extends DomainState {
  status: string
}

class TestEvent extends DomainEvent<TestState> {
  readonly action = 'action'

  readonly actor = new Anonymous()

  readonly context: EventContext<TestState>

  readonly params: Readonly<Record<string, unknown>>

  readonly subject = 'Broadcast'

  readonly subjectId: Readonly<string>

  constructor(state: TestState, params: Record<string, unknown>) {
    super()
    this.subjectId = state.id
    this.context = { subjectState: state }
    this.params = params
  }
}

describe('Domain event emitter', () => {
  class TestEventEmitter extends DomainEventEmitter<TestState> {
  }

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should emit events with params', () => {
    const broadcast = new TestEventEmitter({ id: 'entity-id', status: 'on-going' })
    const expectedEvent = new TestEvent(broadcast.getState(), { k: 'v1' })
    broadcast.emit(TestEvent, { k: 'v1' })
    jest.useRealTimers()
    jest.useFakeTimers()
    const expectedEvent2 = new TestEvent(broadcast.getState(), { k: 'v2' })
    broadcast.emit(TestEvent, { k: 'v2' })

    expect(broadcast.changedEvents).toStrictEqual([ expectedEvent, expectedEvent2 ])
  })

  it('should commit and clear event queue', () => {
    const broadcast = new TestEventEmitter({ id: 'entity-id', status: 'on-going' })
    const expectedEvents = [
      new TestEvent(broadcast.getState(), { k: 'v1' }),
      new TestEvent(broadcast.getState(), { k: 'v2' }),
    ]
    broadcast.emit(TestEvent, { k: 'v1' })
    broadcast.emit(TestEvent, { k: 'v2' })

    expect(broadcast.commit()).toStrictEqual(expectedEvents)
    expect(broadcast.changedEvents).toHaveLength(0)
  })

  it('should commit idempotent', () => {
    const broadcast = new TestEventEmitter({ id: 'entity-id', status: 'on-going' })

    expect(broadcast.commit()).toHaveLength(0)
    expect(broadcast.changedEvents).toHaveLength(0)
  })
})
