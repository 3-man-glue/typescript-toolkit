import { PubSub, Message as PubSubMessage, GetTopicMetadataResponse, IamPermissionsMap } from '@google-cloud/pubsub'
import logger from '@utils/logger'
import { MessageDto, MessageQueueAdapter, MessageHandler } from '@mq/interfaces'

export class PubSubAdapter implements MessageQueueAdapter {
  private readonly pubsub: Readonly<PubSub>

  constructor() {
    this.pubsub = new PubSub()
  }

  public getTopicMetadata(topicName: string): Promise<GetTopicMetadataResponse> {
    return this.pubsub.topic(topicName).getMetadata()
  }

  public async testPermissions(topicName: string, permissions: string[]): Promise<IamPermissionsMap> {
    const [permission] = await this.pubsub.topic(topicName).iam.testPermissions(permissions)

    return permission
  }

  public async createTopic(topicName: string): Promise<void> {
    const [topics] = await this.pubsub.getTopics()
    let isCreated = false

    topics.forEach((retrievedTopic) => {
      const name = retrievedTopic.name.split('/')
      if (name[name.length - 1] === topicName) {
        isCreated = true
      }
    })

    if (!isCreated) {
      await this.pubsub.createTopic(topicName)
    }
  }

  public subscribe<T extends MessageDto>(subject: string, handlers: MessageHandler<T>[]): void {
    const subscription = this.pubsub.subscription(subject)

    subscription.on('message', async (message: PubSubMessage) => {
      try {
        const data = this.formatMessage<T>(message)
        const results = await Promise.allSettled(handlers.map((handler) => handler.handle(data)))

        const rejected = results.find((result) => result.status === 'rejected')

        if (rejected) {
          logger.error(`Unable to handle the message: ${subject}`, { exception: rejected, data })
          message.nack()
          return
        }

        message.ack()
      } catch (error) {
        logger.error(`Unable to handle the message: ${error}`, { exception: error })
        message.nack()
      }
    })

    subscription.on('error', (error: Error) => {
      logger.error(`Unable to subscribe message: ${error}`, { exception: error })
    })
  }

  public async publish<T>(topic: string, data: T): Promise<void> {
    try {
      const dataBuffer = Buffer.from(JSON.stringify(data), 'utf8')
      await this.pubsub.topic(topic).publish(dataBuffer)
    } catch (error) {
      logger.error(`Unable to publish message: ${error}`, { exception: error, data })
    }
  }

  private formatMessage<T extends MessageDto>(message: PubSubMessage): T {
    const rawData = message.data.toString()

    return JSON.parse(rawData)
  }
}