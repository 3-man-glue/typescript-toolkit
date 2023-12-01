import { PlainObject } from '@utils/common-types'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SubscriberConstructor = new (...args: any[]) => Subscriber

export interface Subscriber {
  subscribe(): void
}

export interface MessageQueueAdapter {
  createTopic(topic: string): Promise<void>
  subscribe<T extends MessageDto>(subject: string, handler: MessageHandler<T>[]): void
  publish(topic: string, data: PlainObject): Promise<void>
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MessageDto {
}

export interface MessageHandler<T> {
  handle(message: T): Promise<void>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MessageHandlerConstructor <T extends MessageDto> = new (...args: any[]) => MessageHandler<T>