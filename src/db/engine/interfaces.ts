import { Condition } from 'db/interfaces'
import { PlainObject } from 'common-types'

export interface Engine {
  select<T>(condition: Condition<T>, tableName: string): Promise<PlainObject[]>
  insert(data: PlainObject[], tableName: string): Promise<void>
  update(data: PlainObject[], condition: PlainObject, tableName: string): Promise<void>
  delete(condition: PlainObject, tableName: string): Promise<void>
}

export type ReturnedQuery = {
  query: string,
  params: unknown[]
}
