import { Logger } from '@utils/logger'
import Container from 'typedi'
import { LoaderFunction, SubscriberConstructor } from './interfaces'

export class Subscription {
  private readonly logger: Logger

  private static subscription: Subscription

  private subscriberConstructors: SubscriberConstructor[] = []

  private loader: LoaderFunction = () => Promise.resolve()

  private constructor(logger: Logger) {
    this.logger = logger
  }

  static create(logger: Logger): Subscription {
    if (this.subscription) {
      return this.subscription
    }
    this.subscription = new Subscription(logger)

    return this.subscription
  }

  public setLoaderFunction(fn: LoaderFunction): this {
    this.loader = fn

    return this
  }

  public registerSubscriber(Subscriber: SubscriberConstructor): this {
    this.subscriberConstructors.push(Subscriber)

    return this
  }

  public clearAllSubscribers(): this {
    this.subscriberConstructors.length = 0

    return this
  }

  public async start(): Promise<void> {
    try {
      await this.loader()
      this.bootstrap()
    } catch (error) {
      this.raiseException(error)
    }
  }

  private bootstrap(): void {
    this.subscriberConstructors.forEach((Subscriber: SubscriberConstructor) => {
      const subscriber = Container.has(Subscriber) ? Container.get(Subscriber) : new Subscriber()

      subscriber.subscribe()
    })
  }

  private raiseException(e: Error): void {
    this.logger.error(`Unable to bootstrap Subscription server: ${e}`, { exception: e })
  }
}
