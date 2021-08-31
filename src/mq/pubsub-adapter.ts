import { Service } from 'typedi'
import { PubSub, Message as PubSubMessage } from '@google-cloud/pubsub'
import { ConfigService } from '@config/config'
import { PlainObject } from '@utils/common-types'
import { MessageDto, PublisherAdapter } from '@mq/interfaces'
import logger from '@utils/logger'
import { MessageHandler } from '@mq/client/interfaces'

@Service()
export class PubSubAdapter implements PublisherAdapter {
  private readonly pubsub: Readonly<PubSub>

  constructor({ googleCloud: pubsub }: ConfigService) {
    this.pubsub = new PubSub({ projectId: pubsub.projectId })
  }

  public subscribe<T extends MessageDto>(subject: string, handler: MessageHandler<T>): void {
    const subscription = this.pubsub.subscription(subject)

    subscription.on('message', async (message: PubSubMessage) => {
      try {
        const data = this.formatMessage<T>(message)
        await handler.handle(data)

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

  public async publish(topic: string, data: PlainObject): Promise<void> {
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
