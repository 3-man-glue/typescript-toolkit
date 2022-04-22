import { DomainEventInterface, DomainState, EventContext, EventParams } from '@ddd/interfaces'
import IdGen from '@utils/id-generator'
import { Identity, PlainObject } from '@utils/common-types'

export abstract class DomainEvent<T extends DomainState, K extends EventParams = Record<string, unknown>>
implements DomainEventInterface<T, K> {
  readonly id: string

  readonly timestamp: number

  abstract readonly action: string

  abstract readonly actor: Identity

  abstract readonly params: K

  abstract readonly context: EventContext<T>

  abstract readonly subject: string

  abstract readonly subjectId: string

  constructor(id?: string, timestamp?: number) {
    this.id = id ?? IdGen.cuid({ value: 'EV' })
    this.timestamp = timestamp ?? Date.now()
  }

  public toJSON(): PlainObject {
    return Object.freeze({
      id: this.id,
      timestamp: this.timestamp,
      action: this.action,
      actor: this.actor,
      params: this.params,
      context: this.context,
      subject: this.subject,
      subjectId: this.subjectId,
    })
  }
}
