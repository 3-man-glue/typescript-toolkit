import { Logger } from '@utils/logger'
import { Subscription } from '@mq/subscription'
import { BaseSubscriber } from '@mq/subscriber'
import Container, { Service } from 'typedi'
import { MessageDto } from '@mq/interfaces'

const mockSubscribeMethod = jest.fn()

@Service()
class MockSubscriber extends BaseSubscriber<MessageDto> {
  public subscribe() {
    mockSubscribeMethod()
  }
}

class IndependentSubscriber extends BaseSubscriber<MessageDto> {
  public subscribe() {
    mockSubscribeMethod()
  }
}

describe('Subscription', () => {
  const mockLogger = { error: jest.fn() } as unknown as Logger
  let subscription: Subscription
  let mockSubscriber: MockSubscriber

  beforeEach(() => {
    mockSubscriber = {
      subscribe: jest.fn(),
    } as unknown as MockSubscriber
    Container.set(MockSubscriber, mockSubscriber)
    subscription = Subscription.create(mockLogger)
  })

  afterEach(() => {
    subscription.clearAllSubscribers()
    Container.reset()
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('static create()', () => {
    it('should retain singleton property', () => {
      const firstInstance = Subscription.create({ error: jest.fn() } as unknown as Logger)
      const secondInstance = Subscription.create({ info: jest.fn() } as unknown as Logger)

      expect(firstInstance).toBeInstanceOf(Subscription)
      expect(secondInstance).toStrictEqual(firstInstance)
    })
  })

  describe('start()', () => {
    it('should call loader function given set loader function', async () => {
      const mockLoader = jest.fn()

      await subscription.setLoaderFunction(mockLoader).start()

      expect(mockLoader).toHaveBeenCalledTimes(1)
    })

    it('should log error given loader got error', async () => {
      const mockLoader = jest.fn().mockRejectedValueOnce(new Error('loader-error'))

      await subscription.setLoaderFunction(mockLoader).start()

      expect(mockLogger.error).toHaveBeenCalledTimes(1)
    })

    it('should subscriber calls subscribe given register subscriber', async () => {
      await subscription.registerSubscriber(MockSubscriber).start()

      expect(mockSubscriber.subscribe).toHaveBeenCalledTimes(1)
    })

    it('should subscribers call subscribe given register 2 subscribers', async () => {
      await subscription.registerSubscriber(MockSubscriber).registerSubscriber(IndependentSubscriber).start()

      expect(mockSubscriber.subscribe).toHaveBeenCalledTimes(1)
      expect(mockSubscribeMethod).toHaveBeenCalledTimes(1)
    })
  })
})
