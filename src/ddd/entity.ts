import { DomainState, EntityInterface } from '@ddd/interfaces'
import IdGen from '@utils/id-generator'

export abstract class Entity<T extends DomainState> implements EntityInterface<T> {
  protected idPrefix!: string

  protected state: T

  constructor(params?:  Partial<{ state: T, idPrefix: string }>) {
    this.state = params?.state
      ? params.state
      : { id: IdGen.cuid(params?.idPrefix ? { value: params.idPrefix } : undefined) } as T
  }

  get id(): string {
    return this.state.id
  }

  public getState(): Readonly<T> {
    return Object.freeze(this.state)
  }

  protected setState(state: Omit<T, 'id'>): this {
    this.state = { id: this.id, ...state } as T

    return this
  }

  protected patchState(state: Partial<Omit<T, 'id'>>): this {
    this.state = { ...this.state, ...state }

    return this
  }
}
