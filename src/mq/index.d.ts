import { MessageHandler, MessageHandlerConstructor } from '@mq/client/interfaces'
import { LoaderFunction, MessageDto, Subscriber, SubscriberConstructor } from '@mq/interfaces'
import { PlainObject } from '@utils/common-types'
import { Logger } from '@utils/logger'

export declare type SubscriberConstructor = new (...args: any[]) => Subscriber
export interface Subscriber {
  subscribe(): void
}
export interface MessageQueueAdapter {
  createTopic(topic: string): Promise<void>
  subscribe<T extends MessageDto>(subject: string, handler: MessageHandler<T>): void
  publish(topic: string, data: PlainObject): Promise<void>
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MessageDto {}
export interface MessageHandler<T> {
  handle(message: T): Promise<void>
}
export declare type MessageHandlerConstructor<T extends MessageDto> = new (...args: any[]) => MessageHandler<T>

export declare abstract class BaseSubscriber<T extends MessageDto> implements Subscriber {
  protected client: MessageQueueAdapter

  protected readonly subject: string

  protected handlers: MessageHandlerConstructor<T>[]

  subscribe(): void
}

export declare class Subscription {
  private constructor()

  static create(logger: Logger): Subscription

  setLoaderFunction(fn: LoaderFunction): this

  registerSubscriber(Subscriber: SubscriberConstructor): this

  clearAllSubscribers(): this

  start(): Promise<void>
}
