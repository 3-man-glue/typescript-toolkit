import { DomainEvent as DomainEventInterface, DomainState, EventContext, EventParams } from '@ddd/interfaces'
import IdGen from '@utils/id-generator'
import { Identity } from '@http/identity/interfaces'

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
}
