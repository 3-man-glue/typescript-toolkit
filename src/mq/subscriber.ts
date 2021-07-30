import { Subscriber, SubscriberHandler } from './interfaces'
import { PubSubClient } from '@mq/client/interfaces'

export abstract class BaseSubscriber<T> implements Subscriber {
  protected client!: PubSubClient<T>

  protected readonly subject!: string

  protected handlers!: SubscriberHandler<T>[]

  public subscribe(): void {
    this.handlers.forEach((handler: SubscriberHandler<T>) => {
      this.client.subscribe(this.subject, handler)
    })
  }
}
