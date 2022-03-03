import { EventStreamConfig } from '@config/interfaces'
import {
  DomainEventInterface,
  DomainState,
  EventEmitter,
  EventPublisherInterface
} from '@ddd/interfaces'
import { MessageQueueAdapter } from '@mq/interfaces'
import logger from '@utils/logger'

export class EventPublisher implements EventPublisherInterface {
  private publisher: Readonly<MessageQueueAdapter>

  readonly #topicName: string

  constructor(publisher: MessageQueueAdapter, config: EventStreamConfig) {
    this.publisher = publisher
    this.#topicName = config.streamTopicName
  }

  public async publish<T extends DomainState>(emitter: EventEmitter<T>)
    : Promise<DomainEventInterface<T>[]> {
    const events = emitter.commit()
    await Promise.all(events.map(event => this.publisher.publish(this.#topicName, event.toJSON())))
      .catch(error => {
        logger.error(`Unable to publish message: ${error}`, { exception: error, emitter, topic: this.#topicName })
      })

    return events
  }
}
