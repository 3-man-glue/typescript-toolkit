import { ConfigService } from '@config/config'
import { MessageHandler, MessageHandlerConstructor } from '@mq/client/interfaces'
import { LoaderFunction, MessageDto, PublisherAdapter, Subscriber, SubscriberConstructor } from '@mq/interfaces'
import { PlainObject } from '@utils/common-types'
import { Logger } from '@utils/logger'
import { DictMapper } from '@config/interfaces'

export declare type GoogleCloudConfig = {
  projectId: string
}
export declare type NackFunction = () => void
export interface PubSubClient<T> {
  subscribe(subject: string, handler: (message: T, nack: NackFunction) => Promise<void>): void
  publish(topic: string, data: PlainObject): void
}
export interface MessageHandler<T> {
  handle(message: T): Promise<void>
}
export declare type MessageHandlerConstructor<T extends MessageDto> = new (...args: any[]) => MessageHandler<T>

export declare class Subscription {
  static create(logger: Logger): Subscription

  setLoaderFunction(fn: LoaderFunction): this

  registerSubscriber(Subscriber: SubscriberConstructor): this

  clearAllSubscribers(): this

  start(): Promise<void>
}

export declare abstract class BaseSubscriber<T extends MessageDto> implements Subscriber {
  protected client: PublisherAdapter

  protected readonly subject: string

  protected handlers: MessageHandlerConstructor<T>[]

  subscribe(): void
}

export declare class PubSubAdapter implements PublisherAdapter {
  constructor({ googleCloud: pubsub }: ConfigService)

  subscribe<T extends MessageDto>(subject: string, handler: MessageHandler<T>): void

  publish(topic: string, data: PlainObject): Promise<void>
}

export declare type SubscriberConstructor = new (...args: any[]) => Subscriber
export interface Subscriber {
  subscribe(): void
}
export declare type LoaderFunction = () => Promise<void>
export interface PublisherAdapter {
  subscribe<T extends MessageDto>(subject: string, handler: MessageHandler<T>): void
  publish(topic: string, data: PlainObject): Promise<void>
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MessageDto {}

export declare const googleCloudDictionary: DictMapper

export declare const pubSubsDictionary: DictMapper
