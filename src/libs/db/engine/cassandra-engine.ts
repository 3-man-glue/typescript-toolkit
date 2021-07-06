import { DBException } from 'libs/http-app/exception/db-exception';
import { getInsertQueries, getSelectQuery } from 'libs/db/engine/generate-query'
import { Condition } from 'libs/db/interfaces'
import cassandra from 'cassandra-driver'
import { Engine as EngineInterface } from 'libs/db/engine/interfaces'
import { ConfigService } from 'libs/http-app/config/config'
import { PlainObject } from 'libs/common-types'
import { Service } from 'typedi'

@Service()
export class CassandraEngine implements EngineInterface {
  private client: cassandra.Client
  constructor(config: ConfigService) {
    try {
      const authProvider = new cassandra.auth
        .PlainTextAuthProvider(config.cassandra.username, config.cassandra.password)

      this.client = new cassandra.Client({
        authProvider,
        contactPoints: config.cassandra.contactPoints,
        localDataCenter: config.cassandra.dataCenter,
        keyspace: config.cassandra.keyspace,
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
