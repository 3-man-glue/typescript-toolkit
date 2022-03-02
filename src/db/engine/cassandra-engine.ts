import { DBException } from '@http-kit/exception/db'
import { getInsertQueries, getSelectQuery } from '@db/engine/generate-query'
import { Condition } from '@db/interfaces'
import cassandra from 'cassandra-driver'
import { Engine as EngineInterface } from '@db/engine/interfaces'
import { CassandraConfig } from '@config/interfaces'
import { PlainObject } from '@utils/common-types'
import { Service } from 'typedi'

@Service()
export class CassandraEngine implements EngineInterface {
  private client: cassandra.Client

  constructor(config: CassandraConfig) {
    try {
      const authProvider = new cassandra.auth
        .PlainTextAuthProvider(config.username, config.password)

      this.client = new cassandra.Client({
        authProvider,
        contactPoints: config.contactPoints,
        localDataCenter: config.dataCenter,
        keyspace: config.keyspace,
      })
    } catch (error) {
      throw new DBException(error.message)
    }
  }

  async select<T>(condition: Condition<T>, tableName: string): Promise<PlainObject[]> {
    const { query, params } = getSelectQuery(condition, tableName)
    const result = await this.client.execute(query, params, { prepare: true })

    return result?.rows ?? []
  }

  async insert(data: PlainObject[], tableName: string): Promise<void> {
    const queries = getInsertQueries(data, tableName)
    await this.client.batch(queries, { prepare: true })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_data: PlainObject[]): Promise<void> {
    return Promise.resolve()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delete(_condition: PlainObject): Promise<void> {
    return Promise.resolve()
  }
}
