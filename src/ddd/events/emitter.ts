import { Entity } from '@ddd/entity'
import {
  ActionConstructor,
  DomainEventInterface,
  DomainState,
  EventConstructor,
  EventEmitter as EventEmitterInterface,
  EventParams
} from '@ddd/interfaces'

export class DomainEventEmitter<T extends DomainState> extends Entity<T> implements EventEmitterInterface<T> {
  protected events: DomainEventInterface<T>[] = []

  get changedEvents(): Readonly<DomainEventInterface<T>[]> {
    return Object.freeze([ ...this.events ])
  }

  public emit<K extends EventParams>(Event: EventConstructor<T, K>, params?: K): this {
    this.events.push(new Event(this.state, params))

    return this
  }

  public commit(): DomainEventInterface<T>[] {
    const committed = [ ...this.events ]
    this.events.length = 0

    return committed
  }

  public act<K extends EventParams>(Action: ActionConstructor<T, K>, params?: K): void {
    const action = new Action(params)
    const { state, Event } = action.validate()

    this.patchState(state)
    this.emit(Event, params)
  }
}
