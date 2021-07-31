export type SubscriberHandler<T> = (message: T, nack: () => void) => Promise<void>

export interface Subscriber {
  subscribe(): void
}

