import { ConfigService } from '@config/config'
import { Engine, ReturnedQuery } from '@db/engine/interfaces'
import { PlainObject } from '@utils/common-types'
import cassandra from 'cassandra-driver'
import { DictMapper } from '@config/interfaces'
import { QueryOptions } from '@db/engine/generate-query'

export interface Engine {
  updateCounter(subject: string, subjectId: string, changingValue: number): Promise<void>
  select<T>(condition: Condition<T>, tableName: string, options?: QueryOptions): Promise<PlainObject[]>
  concurrentSelect<T>(conditions: Condition<T>[], tableName: string, options?: QueryOptions): Promise<PlainObject[]>
  insert(data: PlainObject[], tableName: string): Promise<void>
  update(data: PlainObject[], condition: PlainObject, tableName: string): Promise<void>
  delete(condition: PlainObject, tableName: string): Promise<void>
  raw(query: string, params: unknown[]): Promise<void>
}
export declare type ReturnedQuery = {
  query: string
  params: unknown[]
}

export declare type CassandraConsistenciesString = keyof typeof cassandra.types.consistencies

export declare type ConsistencyOptions = {
  read: CassandraConsistenciesString
  write: CassandraConsistenciesString
}

export declare const getInsertQueries: (data: PlainObject[], tableName: string) => ReturnedQuery[]
export declare const getUpdateCounterQuery: (condition: Record<string, unknown>, changingValue: number) => ReturnedQuery
export declare const getSelectQuery: <T>(
  condition: Condition<T>,
  tableName: string,
  options?: QueryOptions,
) => ReturnedQuery

export declare class CassandraEngine implements Engine {

  constructor(config: ConfigService)

  select<T>(condition: Condition<T>, tableName: string): Promise<PlainObject[]>

  insert(data: PlainObject[], tableName: string): Promise<void>

  update(_data: PlainObject[]): Promise<void>

  delete(_condition: PlainObject): Promise<void>
}

export declare abstract class Table<T extends State> implements DataFactory<T>, Query<T> {

  protected engine: Engine

  protected schema: Schema

  constructor(engine: Engine, schema: Schema, name: string)

  select(condition: Condition<T>): Promise<T[]>

  insert(recordState: T[]): Promise<void>

  update(recordState: T[], condition: Condition<T>): Promise<void>

  delete(condition: Condition<T>): Promise<void>

  abstract plainObjectFactory(state: T): PlainObject

  abstract stateObjectFactory(object: PlainObject): T
}

export declare enum Operation {
  EQ = '=',
  GT = '>',
  GTE = '>=',
  LT = '<',
  LTE = '<=',
  NE = '!=',
  IN = 'IN',
}
export declare type Condition<T> = {
  [K in keyof T]?: QueryPattern | OperationPattern
}
export declare type Order = 'asc' | 'desc'
export declare type QueryPattern = {
  [K in keyof QueryFunction]?: QueryFunction[K]
}
export declare type OperationPattern = {
  [K in Operation]?: unknown
}
export interface DataFactory<T extends State> {
  plainObjectFactory(state: T): PlainObject
  stateObjectFactory(object: PlainObject): T
}
export interface Query<T extends State> {
  select(condition: Condition<T>): Promise<T[]>
  insert(data: T[]): Promise<void>
  update(data: T[], condition: Condition<T>): Promise<void>
  delete(condition: Condition<T>): Promise<void>
}
export interface QueryFunction {
  order: Order
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Schema {}
export interface State {
  id: string
}

export declare interface PageOptions {
  size: number
  page: number
}

export declare interface PaginationMetadata<T> {
  result: T[]
  page: {
    total: number
    current: number
    size: number
  }
}

export declare const cassandraDictionary: DictMapper
