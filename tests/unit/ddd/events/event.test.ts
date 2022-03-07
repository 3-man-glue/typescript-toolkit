import { Identity } from '@utils/common-types'
import { DomainEvent } from '@ddd/events/event'

jest.mock('@utils/id-generator', () => ({ cuid: jest.fn().mockReturnValue('random-cuid') }))

describe('Domain event abstraction', () => {
  class TestEvent extends DomainEvent<{ id: string }> {
    readonly action!: Readonly<string>

    readonly actor!: Readonly<Identity>

    readonly context = { subjectState: { id: 'test-id' } }

    readonly params = {}

    readonly subject: Readonly<string> = 'TestDomain'

    readonly subjectId: Readonly<string> = 'test-id'
  }

  beforeEach(() => {
    jest.useFakeTimers('modern')
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should be constructed with default value', () => {
      const event = new TestEvent()

      expect(event.id).toBe('random-cuid')
      expect(event.timestamp).toBe(Date.now())
    })

    it('should be constructed with only id', () => {
      const event = new TestEvent('event-id')

      expect(event.id).toBe('event-id')
      expect(event.timestamp).toBe(Date.now())
    })

    it('should be constructed with only timestamp', () => {
      const event = new TestEvent(undefined, 123)

      expect(event.id).toBe('random-cuid')
      expect(event.timestamp).toBe(123)
    })
  })
  describe('toJSON', () => {
    it('should return immutable value object of event', () => {
      const event = new TestEvent()
      const expectedOutput = {
        id: 'random-cuid',
        timestamp: Date.now(),
        action: undefined,
        params: {},
        context: {
          subjectState: { id: 'test-id' },
        },
        subject: 'TestDomain',
        subjectId: 'test-id',
      }

      const output = event.toJSON()

      expect(output).toStrictEqual(expectedOutput)
      expect(Object.isFrozen(output)).toBeTruthy()
    })
  })
})
