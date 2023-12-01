import Container from 'typedi'
import { MessageQueueAdapter, Subscriber, MessageDto, MessageHandlerConstructor } from '@mq/interfaces'

export abstract class BaseSubscriber<T extends MessageDto> implements Subscriber {
  protected client: MessageQueueAdapter

  protected readonly subject!: string

  protected handlers!: MessageHandlerConstructor<T>[]

  constructor(client: MessageQueueAdapter) {
    this.client = client
  }

  public subscribe(): void {
    this.client.subscribe<T>(
      this.subject,
      this.handlers.map((Handler: MessageHandlerConstructor<T>) => {
        return Container.has(Handler) ? Container.get(Handler) : new Handler()
      }),
    )
  }
}
