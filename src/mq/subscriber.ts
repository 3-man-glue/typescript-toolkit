import Container from 'typedi'
import { PublisherAdapter, Subscriber, MessageDto } from '@mq/interfaces'
import { MessageHandlerConstructor } from '@mq/client/interfaces'

export abstract class BaseSubscriber<T extends MessageDto> implements Subscriber {
  protected client!: PublisherAdapter

  protected readonly subject!: string

  protected handlers!: MessageHandlerConstructor<T>[]

  public subscribe(): void {
    this.handlers.forEach((Handler: MessageHandlerConstructor<T>) => {
      const handler = Container.has(Handler) ? Container.get(Handler) : new Handler()
      this.client.subscribe<T>(this.subject, handler)
    })
  }
}
