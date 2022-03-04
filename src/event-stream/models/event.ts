import { EventState } from '@event-stream/repos/interfaces'

export class Event {
  #state: EventState

  constructor(state: EventState) {
    this.#state = state
  }

  public get state(): EventState {
    return Object.freeze(this.#state)
  }
}
