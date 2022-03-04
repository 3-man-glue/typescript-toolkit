import { Service } from 'typedi'
import { Engine } from '@db/engine/interfaces'
import { Operation } from '@db/interfaces'
import { Event } from '@event-stream/models/event'
import { EventDBState } from '@event-stream/repos/interfaces'
import { PlainObject } from '@utils/common-types'

@Service()
export class EventRepository {
  #dbClient: Engine

  constructor(dbClient: Engine) {
    this.#dbClient = dbClient
  }

  public async getByAggregateRoot(id: string): Promise<Event[]> {
    const events = (await this.#dbClient.select(
      {
        root_id: {
          [Operation.EQ]: id,
        },
      },
      'event',
    )) as unknown as EventDBState[]

    return events.map(this.createEvent)
  }

  public async save(event: Event): Promise<void> {
    await this.#dbClient.insert([ this.createEventDBState(event) ], 'event')
  }

  private createEventDBState(event: Event): PlainObject {
    const eventState = event.state

    return {
      root_id: eventState.rootId,
      subject_id: eventState.subjectId,
      event_id: eventState.eventId,
      subject: eventState.subject,
      context: JSON.stringify(eventState.context),
      params: JSON.stringify(eventState.params),
      action: eventState.action,
      actor: {
        id: eventState.actor.id,
        alias: eventState.actor.alias,
        external_id: eventState.actor.externalId,
        role: {
          external_role: eventState.actor.role.externalRole,
          role: eventState.actor.role.role,
        },
      },
      timestamp: eventState.timestamp.getTime(),
      created_at: eventState.createdAt.getTime(),
    }
  }

  private createEvent(dbState: EventDBState): Event {
    const state = {
      rootId: dbState.root_id,
      subjectId: dbState.subject_id,
      eventId: dbState.event_id,
      subject: dbState.subject,
      params: JSON.parse(dbState.params),
      context: JSON.parse(dbState.context),
      action: dbState.action,
      actor: {
        id: dbState.actor.id,
        alias: dbState.actor.alias,
        externalId: dbState.actor.external_id,
        role: {
          externalRole: dbState.actor.role.external_role,
          role: dbState.actor.role.role,
        },
      },
      timestamp: new Date(Number( dbState.timestamp.toString() )),
      createdAt: new Date(Number( dbState.created_at.toString() )),
    }

    return new Event(state)
  }
}
