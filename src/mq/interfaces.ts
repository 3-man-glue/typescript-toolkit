import { PlainObject } from '@utils/common-types'
import { MessageHandler } from '@mq/client/interfaces'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SubscriberConstructor = new (...args: any[]) => Subscriber
export interface Subscriber {
  subscribe(): void
}

// don't forget to remove these lines when sync mq folder
export interface PublisherAdapter {
  subscribe<T extends MessageDto>(subject: string, handler: MessageHandler<T>): void
  publish(topic: string, data: PlainObject): Promise<void>
}

export interface MessageQueueAdapter {
  createTopic(topic: string): Promise<void>
  subscribe<T extends MessageDto>(subject: string, handler: MessageHandler<T>): void
  publish(topic: string, data: PlainObject): Promise<void>
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MessageDto {
}

export const googleCloudDictionary = {
  projectId: {
    env: 'GOOGLE_CLOUD_PROJECT',
  },
}

export const pubSubDictionary = {
  projectId: {
    env: 'PUBSUB_PROJECT_ID',
  },
}
