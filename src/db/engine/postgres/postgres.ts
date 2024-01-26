import postgres, { Client } from 'pg'
import { DBException } from '@http-kit/exception/db'
import { PostgresConfig, Condition } from '@db/interfaces'
import { Engine as EngineInterface } from '@db/engine/interfaces'
import { PlainObject } from '@utils/common-types'
import { NotImplementedException } from '@http-kit/exception/not-implemented'
import { getSelectQuery, getInsertQueries, getUpdateQueries } from '@db/engine/postgres/generate-query'
import { QueryOptions } from '@db/engine/generate-query'

export class PostgresEngine implements EngineInterface {
  private readonly client: postgres.Client

  constructor(config: PostgresConfig) {
    try {
      this.client = new Client({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
      })
      this.client.connect()
    } catch (error) {
      throw new DBException(error.message)
        .withCause(error)
        .withInput({
          host: config.host,
          user: config.user,
          password: config.password,
          database: config.database,
        })
    }
  }

  public async select<T>(condition: Condition<T>, tableName: string, options?: QueryOptions): Promise<PlainObject[]> {
    try {
      const { query, params } = getSelectQuery(condition, tableName, options)
      const result = await this.client.query(query, params)

      return result?.rows ?? []
    } catch (error) {
      throw new DBException(error.message)
        .withCause(error)
        .withInput({
          condition,
          tableName,
          options,
        })
    }
  }

  public async insert(data: PlainObject[], tableName: string): Promise<void> {
    try {
      const queries = getInsertQueries(data, tableName)
      await this.client.query(queries.query, queries.params)
    } catch (error) {
      throw new DBException(error.message)
        .withCause(error)
        .withInput({
          data,
          tableName,
        })
    }
  }

  public async update<T>(data: PlainObject[], condition: Condition<T>[], tableName: string): Promise<void> {

    try {
      const queries = getUpdateQueries(data, condition, tableName)
      await Promise.all(
        queries.map(query =>
          this.client.query(query.query, query.params)
        )
      )
    } catch (error) {
      throw new DBException(error.message)
        .withCause(error)
        .withInput({
          data,
          condition,
          tableName,
        })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public delete(_condition: PlainObject, _tableName: string): Promise<void> {
    throw new NotImplementedException('delete method not implemented for Postgres Adaptor')
  }

}
