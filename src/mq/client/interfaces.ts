import { PlainObject } from '@utils/common-types'
import { MessageDto } from '@mq/interfaces'

export type GoogleCloudConfig = {
  projectId: string
}
export type NackFunction = () => void

export interface PubSubClient<T> {
  subscribe(subject: string, handler: (message: T, nack: NackFunction) => Promise<void>): void

  publish(topic: string, data: PlainObject): void
}

export interface MessageHandler<T> {
  handle(message: T): Promise<void>
}

export type MessageHandlerConstructor <T extends MessageDto> = new (...args: any[]) => MessageHandler<T>
