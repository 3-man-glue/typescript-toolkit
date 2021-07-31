import { PlainObject } from '@utils/common-types'

export type GoogleCloudConfig = {
  projectId: string
}
export type NackFunction = () => void

export interface PubSubClient<T> {
  subscribe(subject: string, handler: (message: T, nack: NackFunction) => Promise<void>): void

  publish(topic: string, data: PlainObject): void
}
