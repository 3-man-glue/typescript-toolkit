import cassandra from 'cassandra-driver'
import { Condition } from '@db/interfaces'
import { PlainObject } from '@utils/common-types'
import { QueryOptions } from '@db/engine/generate-query'
import { Firestore } from '@google-cloud/firestore'

export interface Engine<T = PlainObject> {
  select<K>(condition: Condition<K>, tableName: string, options?: QueryOptions): Promise<T[]>
  insert(data: T[], tableName: string): Promise<void>
  update<K>(data: T[], condition: Condition<K>[], tableName: string): Promise<void>
  delete<K>(condition: Condition<K>, tableName: string): Promise<void>
}

export interface FirestoreDataObject extends PlainObject {
  _id?: string
}

export interface FirestoreEngineInterface extends Engine<FirestoreDataObject> {
  firestore: Firestore
  getById(id: string, tableName: string): Promise<FirestoreDataObject | undefined>
  updateById(data: Omit<FirestoreDataObject, '_id'>, id: string, tableName: string): Promise<void>
  deleteById(id: string, tableName: string): Promise<void>
}

export interface CassandraInterface extends Engine {
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
