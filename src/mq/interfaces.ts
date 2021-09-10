import { PlainObject } from '@utils/common-types'
import { MessageHandler } from '@mq/client/interfaces'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SubscriberConstructor = new (...args: any[]) => Subscriber
export interface Subscriber {
  subscribe(): void
}

export interface PublisherAdapter {
  subscribe<T extends MessageDto>(subject: string, handler: MessageHandler<T>): void
  publish(topic: string, data: PlainObject): Promise<void>
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MessageDto {
}
