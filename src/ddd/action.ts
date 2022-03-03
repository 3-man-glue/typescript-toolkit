import { EventData } from './interfaces'
import { DomainState, EventParams } from '@ddd/interfaces'

export abstract class Action<T extends DomainState, K extends EventParams> {
  protected readonly params?: K

  constructor(params?: K) {
    this.params = params
  }

  abstract validate(): EventData<T, K>
}
