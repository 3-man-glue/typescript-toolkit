import { Entity } from '@ddd/entity'
import { PublisherAdapter } from '@mq/interfaces'
import { Entity as EntityInterface } from '@ddd/interfaces'
import { Dimension as DimensionInterface, Identity, PlainObject } from '@utils/common-types'
export declare class Dimension implements DimensionInterface {
  height: number

  width: number

  constructor(width: number, height: number)

  toString(): string
}

export declare abstract class Entity<T extends DomainState> implements EntityInterface<T> {
  protected idPrefix: string

  protected state: T

  constructor(state?: T)

  get id(): string

  getState(): Readonly<T>

  protected setState(state: Omit<T, 'id'>): this

  protected patchState(state: Partial<Omit<T, 'id'>>): this
}

export declare class DomainEventEmitter<T extends DomainState> extends Entity<T> implements EventEmitter<T> {
  protected idPrefix: string

  protected events: DomainEvent<T>[]

  get changedEvents(): Readonly<DomainEvent<T>[]>

  emit<K extends EventParams = Record<string, unknown>>(Event: EventConstructor<T, K>, params?: K): this

  commit(): DomainEvent<T>[]
}

export declare class EventPublisher<T extends DomainState> implements Publisher<T> {
  constructor(publisher: PublisherAdapter)

  publish(emitter: EventEmitter<T>, topic: string): Promise<void>
}

export declare abstract class DomainEvent<T extends DomainState, K extends EventParams = Record<string, unknown>>
implements DomainEvent<T, K> {
  readonly id: string

  readonly timestamp: number

  abstract readonly action: string

  abstract readonly actor: Identity

  abstract readonly params: K

  abstract readonly context: EventContext<T>

  abstract readonly subject: string

  abstract readonly subjectId: string

  constructor(id?: string, timestamp?: number)

  toJSON(): PlainObject
}

export interface UseCase<T = void, K = void> {
  execute(input: T): K | Promise<K>
}
export interface State {
  id: string
}
export interface Entity<T extends DomainState> {
  id: string
  getState(): Readonly<T>
}
export interface DomainEventInterface<T extends DomainState, K extends EventParams = Record<string, unknown>> {
  id: Readonly<string>
  subject: Readonly<string>
  subjectId: Readonly<string>
  action: Readonly<string>
  actor: Readonly<Identity>
  timestamp: Readonly<number>
  params: Readonly<K>
  context: EventContext<T>
  toJSON(): PlainObject
}
export interface DomainState {
  id: string
}
export declare type EventContext<T extends DomainState> = {
  subjectState: T
  [key: string]: unknown
}
export declare type EventParams = Record<string, unknown>
export declare type EventConstructor<T extends DomainState, K extends EventParams> = new (
  ...args: any[]
) => DomainEvent<T, K>
export interface EventEmitter<T extends DomainState> {
  emit<K extends EventParams = Record<string, unknown>>(Event: EventConstructor<T, K>, params?: K): this
  commit(): DomainEvent<T>[]
}
export interface Publisher<T extends DomainState> {
  publish(event: EventEmitter<T>, topic: string): Promise<void>
}
