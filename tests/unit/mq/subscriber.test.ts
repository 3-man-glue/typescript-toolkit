import 'reflect-metadata'
import { Container, Service } from 'typedi'
import { BaseSubscriber } from '@mq/subscriber'
import { MessageQueueAdapter, MessageHandler } from '@mq/interfaces'

type TestType = Record<string, unknown>

class IndependentHandler implements MessageHandler<TestType> {
  public handle(): Promise<void> {
    return Promise.resolve()
  }
}

@Service()
class DependentHandler implements MessageHandler<TestType> {
  public handle(): Promise<void> {
    return Promise.resolve()
  }
}

const mockMQ = ({ subscribe: jest.fn() } as unknown) as MessageQueueAdapter

class TestSubscriber extends BaseSubscriber<TestType> {
  client = mockMQ

  subject = 'TestSubject'

  handlers = [ IndependentHandler, DependentHandler ]
}

describe('BaseSubscriber Abstraction', () => {
  afterEach(() => {
    Container.reset()
    jest.resetAllMocks()
  })

  describe('subscribe()', () => {
    it('should resolve instance of message handlers and subscribe via message queue', () => {
      const mockClient = {} as MessageQueueAdapter
      const subscriber = new TestSubscriber(mockClient)

      subscriber.subscribe()

      expect(mockMQ.subscribe).toHaveBeenCalledTimes(1)
      expect(mockMQ.subscribe).toHaveBeenCalledWith('TestSubject', [ {}, {} ])
    })
  })
})
