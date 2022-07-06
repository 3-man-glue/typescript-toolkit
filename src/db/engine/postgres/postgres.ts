import postgres, { Client } from 'pg'
import { DBException } from '@http-kit/exception/db'
import { PostgresConfig, Condition } from '@db/interfaces'
import { Engine as EngineInterface } from '@db/engine/interfaces'
import { PlainObject } from '@utils/common-types'
import { NotImplementedException } from '@http-kit/exception/not-implemented'
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

  public select<T>(_condition: Condition<T>, _tableName: string, _options?: QueryOptions): Promise<PlainObject[]> {
    throw new NotImplementedException('select method not implemented for Postgres Adaptor')
  }

  public insert(_data: PlainObject[], _tableName: string): Promise<void> {
    throw new NotImplementedException('insert method not implemented for Postgres Adaptor')
  }

  public update<T>(_data: PlainObject[], _condition: Condition<T>, _tableName: string): Promise<void> {
    throw new NotImplementedException('update method not implemented for Postgres Adaptor')
  }

  public delete(_condition: PlainObject, _tableName: string): Promise<void> {
    throw new NotImplementedException('delete method not implemented for Postgres Adaptor')
  }

}
