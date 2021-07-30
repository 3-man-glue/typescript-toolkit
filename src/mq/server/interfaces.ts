import { Subscriber } from '@mq/interfaces'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SubscriberConstructor = new (...args: any[]) => Subscriber
export type LoaderFunction = () => Promise<void>
