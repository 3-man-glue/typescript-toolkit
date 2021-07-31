import { Logger } from '@utils/logger'
import { Subscription } from '@mq/server/subscription'
import { BaseSubscriber } from '@mq/subscriber'

describe('Subscription', () => {
  const mockLogger = { error: jest.fn() } as unknown as Logger
  let subscription: Subscription
  const spySubscribeMethod = jest.fn()
  class MockSubscriber extends BaseSubscriber<unknown> {
    subscribe = spySubscribeMethod
  }

  beforeEach(() => {
    subscription = Subscription.create(mockLogger)
  })

  afterEach(() => {
    subscription.clearAllSubscribers()
    jest.resetModules()
    jest.clearAllMocks()
  })

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

    expect(spySubscribeMethod).toHaveBeenCalledTimes(1)
  })

  it('should subscribers call subscribe given register 2 subscribers', async () => {
    await subscription.registerSubscriber(MockSubscriber).registerSubscriber(MockSubscriber).start()

    expect(spySubscribeMethod).toHaveBeenCalledTimes(2)
  })
})
