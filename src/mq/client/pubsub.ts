import { PubSub, Message } from '@google-cloud/pubsub'
import { PlainObject } from '@utils/common-types'
import { Logger } from '@utils/logger'
import { GoogleCloudConfig } from '@config/interfaces'
import { Service } from 'typedi'
import { NackFunction, PubSubClient } from './interfaces'

@Service()
export class GooglePubSub<T> implements PubSubClient<T> {
  private readonly pubsub: Readonly<PubSub>

  private readonly logger: Readonly<Logger>

  constructor(googleCloud: GoogleCloudConfig, logger: Logger) {
    this.pubsub = new PubSub({ projectId: googleCloud.projectId })
    this.logger = logger
  }

  public subscribe(subject: string, handler: (message: T, nack: NackFunction) => Promise<void>): void {
    const subscription = this.pubsub.subscription(subject)
    subscription.on('message', async (message: Message) => {
      const data = this.formatMessage(message)
      await handler(data, message.nack)
    })

    subscription.on('error', (error: Error) => {
      this.logger.error(`Unable to subscribe message: ${error}`, { exception: error })
    })
  }

  public async publish(topic: string, data: PlainObject): Promise<void> {
    try {
      const dataBuffer = Buffer.from(JSON.stringify(data), 'utf8')
      await this.pubsub.topic(topic).publish(dataBuffer)
    } catch (error) {
      this.logger.error(`Unable to publish message: ${error}`, { exception: error, data })
    }
  }

  private formatMessage(message: Message): T {
    const rawData = message.data
    const jsonData = rawData && rawData.toString('base64').trim()
    const data = JSON.parse(jsonData)

    return {
      ...data,
      messageInstance: message,
    }
  }
}
