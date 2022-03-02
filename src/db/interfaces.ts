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

export type Condition<T> = {
  [K in keyof T]?: QueryPattern | OperationPattern
}
export type Order = 'asc' | 'desc'

export type QueryPattern = {
  [K in keyof QueryFunction]?: QueryFunction[K]
}

export type OperationPattern = {
  [K in Operation]?: unknown
}

export interface DataFactory<T extends State> {
  plainObjectFactory(state: T): PlainObject
  stateObjectFactory(object: PlainObject): T
}

export interface Query<T extends State> {
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

export interface State {
  id: string,
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
