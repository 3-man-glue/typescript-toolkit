import { CassandraConsistenciesString } from '@db/engine/interfaces'
import { PlainObject } from '@utils/common-types'

export enum Operation {
  EQ = '=',
  GT = '>',
  GTE = '>=',
  LT = '<',
  LTE = '<=',
  NE = '!=',
  IN = 'IN',
}

export enum FirestoreOperation {
  EQ = '==',
  GT = '>',
  GTE = '>=',
  LT = '<',
  LTE = '<=',
  NE = '!=',
  IN = 'in',
}

export type Condition<T> = {
  [K in keyof T]?: QueryPattern | OperationPattern
}
export type Order = 'asc' | 'desc'

export type QueryPattern = {
  [K in keyof QueryFunction]?: QueryFunction[K]
}

export type OperationPattern = {
  [K in Operation | FirestoreOperation]?: unknown
}

export interface DataFactory<T extends DBState> {
  plainObjectFactory(state: T): PlainObject
  stateObjectFactory(object: PlainObject): T
}

export interface Query<T extends DBState> {
  select(condition: Condition<T>): Promise<T[]>,
  insert(data: T[]): Promise<void>,
  update(data: T[], condition: Condition<T>): Promise<void>,
  delete(condition: Condition<T>): Promise<void>,
}

export interface QueryFunction {
  order: Order,
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Schema {
}

export interface DBState {
  id: string,
}

export interface PageOptions {
  size: number
  page: number
}

export interface PaginationMetadata<T> {
  result: T[]
  page: {
    total: number
    current: number
    size: number
  }
}

export type CassandraConfig = {
  username: string
  password: string
  keyspace: string
  dataCenter: string
  contactPoints: string[]
  readConsistency: CassandraConsistenciesString
  writeConsistency: CassandraConsistenciesString
}

export const cassandraDictionary = {
  username: {
    env: 'DATABASE_CASSANDRA_USERNAME',
  },
  password: {
    env: 'DATABASE_CASSANDRA_PASSWORD',
  },
  keyspace: {
    env: 'DATABASE_CASSANDRA_KEYSPACE',
  },
  readConsistency: {
    env: 'DATABASE_CASSANDRA_READ_CONSISTENCY',
    default: 'localOne',
  },
  writeConsistency: {
    env: 'DATABASE_CASSANDRA_WRITE_CONSISTENCY',
    default: 'quorum',
  },
  dataCenter: {
    env: 'DATABASE_CASSANDRA_DATA_CENTER',
  },
  contactPoints: {
    env: 'DATABASE_CASSANDRA_CONTACT_POINTS',
    type: 'array',
  },
}

export type FirestoreQueryParam = FirestoreConditionPattern[]

export type FirestoreConditionPattern = {
  key: string,
  operation: FirestoreOperation,
  val: string | number | string[] | number[]
}

export type OrderPattern = {
  key: string,
  val: Order
}

export type FirestorePayload = { documentId?: string } & PlainObject

export type PostgresConfig = {
  host: string
  user: string
  password: string
  database: string
}
