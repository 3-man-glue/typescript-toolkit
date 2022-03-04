
export type EventStreamConfig = {
  streamTopicName: string
  streamSubscriptionName: string
}

export const eventStreamDictionary = {
  streamTopicName: {
    env: 'EVENT_STREAM_TOPIC_NAME',
  },
  streamSubscriptionName: {
    env: 'EVENT_STREAM_SUBSCRIPTION_NAME',
  },
}
