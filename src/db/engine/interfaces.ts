import cassandra from 'cassandra-driver'
import { Condition } from '@db/interfaces'
import { PlainObject } from '@utils/common-types'
import { QueryOptions } from '@db/engine/generate-query'

export interface Engine {
  select<T>(condition: Condition<T>, tableName: string, options?: QueryOptions): Promise<PlainObject[]>
  insert(data: PlainObject[], tableName: string): Promise<void>
  update(data: PlainObject[], condition: PlainObject, tableName: string): Promise<void>
  delete(condition: PlainObject, tableName: string): Promise<void>
}

export interface CassandraInterface {
  updateCounter(subject: string, subjectId: string, changingValue: number): Promise<void>
  concurrentSelect<T>(conditions: Condition<T>[], tableName: string, options?: QueryOptions): Promise<PlainObject[]>
  raw(query: string, params?: unknown[]): Promise<void>
}

export type CassandraEngineInterface = Engine & CassandraInterface

export type ReturnedQuery = {
  query: string,
  params: unknown[]
}

export type CassandraConsistenciesString = keyof typeof cassandra.types.consistencies

export type ConsistencyOptions = {
  read: CassandraConsistenciesString
  write: CassandraConsistenciesString
}
