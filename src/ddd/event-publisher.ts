import { DomainState, EventEmitter, Publisher } from '@ddd/interfaces'
import { PublisherAdapter } from '@mq/interfaces'
import logger from '@utils/logger'

export class EventPublisher<T extends DomainState> implements Publisher<T> {
  private publisher: Readonly<PublisherAdapter>

  constructor(publisher: PublisherAdapter) {
    this.publisher = publisher
  }

  public async publish(emitter: EventEmitter<T>, topic: string): Promise<void> {
    try {
      const events = emitter.commit()

      await Promise.all(events.map(event => {
        return this.publisher.publish(topic, event.toJSON())
      }))
    } catch (error) {
      logger.error(`Unable to publish message: ${error}`, { exception: error, emitter, topic })
    }
  }
}
