import { EventStreamConfig } from '@config/interfaces'
import { Entity } from '@ddd/entity'
import { EntityInterface, EventEmitter as EventEmitterInterface } from '@ddd/interfaces'
import { MessageQueueAdapter } from '@mq/interfaces'
import { Dimension as DimensionInterface, Identity, PlainObject } from '@utils/common-types'
export class Dimension implements DimensionInterface {
  height: number

  width: number

  constructor(width: number, height: number)

  toString(): string
}

export abstract class Entity<T extends DomainState> implements EntityInterface<T> {
  protected idPrefix: string

  protected state: T

  constructor(params?:  Partial<{ state: T, idPrefix: string }>)

  get id(): string

  getState(): Readonly<T>

  protected setState(state: Omit<T, 'id'>): this

  protected patchState(state: Partial<Omit<T, 'id'>>): this
}

export class DomainEventEmitter<T extends DomainState> extends Entity<T> implements EventEmitterInterface<T> {
  protected idPrefix: string

  protected events: DomainEvent<T>[]

  get changedEvents(): Readonly<DomainEventInterface<T>[]>

  emit<K extends EventParams>(Event: EventConstructor<T, K>, params?: K): this

  commit(): DomainEventInterface<T>[]

  act<K extends EventParams>(Action: ActionConstructor<T, K>, params?: K): void
}

export class EventPublisher implements EventPublisherInterface {
  constructor(publisher: MessageQueueAdapter, config: EventStreamConfig)

  publish<T extends DomainState>(emitter: EventEmitter<T>): Promise<DomainEventInterface<T>[]>
}

export abstract class DomainEvent<T extends DomainState, K extends EventParams = Record<string, unknown>>
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
export interface EntityInterface<T extends DomainState> {
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
export type EventContext<T extends DomainState> = {
  subjectState: T
  [key: string]: unknown
}

export type EventParams = Record<string, unknown>
export type EventConstructor<T extends DomainState, K extends EventParams> = new (
  ...args: any[]
) => DomainEvent<T, K>
export interface EventEmitter<T extends DomainState> {
  emit<K extends EventParams = Record<string, unknown>>(Event: EventConstructor<T, K>, params?: K): this
  commit(): DomainEvent<T>[]
}
export interface EventPublisherInterface {
  publish<T extends DomainState>(event: EventEmitter<T>)
    : Promise<DomainEventInterface<T>[]>
}

export interface EventData<T extends DomainState, K extends EventParams> {
  state: Partial<T>
  Event: EventConstructor<T, K>
}

export type ActionConstructor<T extends DomainState, K extends EventParams>= new (
  ...args: any[]
) => Action<T, K>

export interface EventMessage {
  id: string
  /**
   * Use a class name as event name
   */
  name: string
  /**
   * Action causing the event
   */
  action: string
  /**
   * Aggregate Root Id
   */
  rootId: string
  /**
   * Entity class name
   */
  subject: string

  /**
   * Entity id / event emitter id
   */
  subjectId: string

  context: EventContext<DomainState>

  params: EventParams
  /**
   * Identity who calls for action and triggers the event
   */
  actor: Identity

  timestamp: number
}

export abstract class Action<T extends DomainState, K extends EventParams> {
  protected readonly params?: K

  constructor(params?: K)

  abstract validate(): EventData<T, K>
}
