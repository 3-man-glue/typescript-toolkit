import { Entity } from '@ddd/entity'
import { DomainState, EventConstructor, EventEmitter as EventEmitterInterface, EventParams } from '@ddd/interfaces'
import { DomainEvent } from '@ddd/event'

export class DomainEventEmitter<T extends DomainState> extends Entity<T> implements EventEmitterInterface<T> {
  protected idPrefix!: string

  protected events: DomainEvent<T>[] = []

  get changedEvents(): Readonly<DomainEvent<T>[]> {
    return Object.freeze([ ...this.events ])
  }

  public emit<K extends EventParams = Record<string, unknown>>(Event: EventConstructor<T, K>, params?: K): this {
    this.events.push(new Event(this.state, params))

    return this
  }

  public commit(): DomainEvent<T>[] {
    const committed = [ ...this.events ]
    this.events.length = 0

    return committed
  }
}
