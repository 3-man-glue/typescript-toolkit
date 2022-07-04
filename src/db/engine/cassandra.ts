import cassandra, { ExecutionProfile } from 'cassandra-driver'
import { DBException } from '@http-kit/exception/db'
import { getInsertQueries, getSelectQuery, getUpdateCounterQuery, QueryOptions  } from '@db/engine/generate-query'
import { CassandraConfig, Condition } from '@db/interfaces'
import { ConsistencyOptions, Engine as EngineInterface } from '@db/engine/interfaces'
import { PlainObject } from '@utils/common-types'
import { NotImplementedException } from '@http-kit/exception/not-implemented'

export class CassandraEngine implements EngineInterface {
  private readonly client: cassandra.Client

  private readonly consistencyOptions: Record<string, cassandra.types.consistencies>

  private readonly CONCURRENT_LEVEL_LIMIT = 50

  constructor(config: CassandraConfig, consistencyOptions: ConsistencyOptions) {
    try {
      const authProvider = new cassandra.auth.PlainTextAuthProvider(
        config.username,
        config.password,
      )

      if (
        !(
          cassandra.types.consistencies[consistencyOptions.read]
          && cassandra.types.consistencies[consistencyOptions.write]
        )
      ) {
        throw new DBException('Invalid consistency')
      }

      this.consistencyOptions = {
        read: cassandra.types.consistencies[consistencyOptions.read],
        write: cassandra.types.consistencies[consistencyOptions.write],
      }

      this.client = new cassandra.Client({
        authProvider,
        contactPoints: config.contactPoints,
        localDataCenter: config.dataCenter,
        keyspace: config.keyspace,
        profiles: [
          new ExecutionProfile('read-consistency', {
            consistency: this.consistencyOptions['read'],
          }),
        ],
      })
    } catch (error) {
      throw new DBException(error.message)
    }
  }

  async updateCounter(subject: string, subjectId: string, changingValue: number): Promise<void> {
    const { query, params } = getUpdateCounterQuery(
      {
        subject,
        subject_id: subjectId,
      },
      changingValue,
    )

    await this.client.execute(query, params, {
      prepare: true,
      consistency: this.consistencyOptions['write'],
    })
  }

  async select<T>(condition: Condition<T>, tableName: string, options?: QueryOptions): Promise<PlainObject[]> {
    const { query, params } = getSelectQuery(condition, tableName, options)
    const result = await this.client.execute(query, params, {
      prepare: true,
      consistency: this.consistencyOptions['read'],
    })

    return result?.rows ?? []
  }

  async concurrentSelect<T>(
    conditions: Condition<T>[],
    tableName: string,
    options?: QueryOptions,
  ): Promise<PlainObject[]> {
    const queryAndParameters = conditions.map((condition: Condition<T>) => {
      return getSelectQuery(condition, tableName, options)
    })

    const result = await cassandra.concurrent.executeConcurrent(this.client, queryAndParameters, {
      executionProfile: 'read-consistency',
      collectResults: true,
      concurrencyLevel: this.CONCURRENT_LEVEL_LIMIT,
    })

    if (result.errors.length) {
      const error = result.errors[0] as Error
      throw new DBException().withCause(error).withInput({ conditions, tableName })
    }

    return result.resultItems
      ? result.resultItems.flatMap(result => (result.rows))
      : []
  }

  public async insert(data: PlainObject[], tableName: string): Promise<void> {
    const queries = getInsertQueries(data, tableName)
    await this.client.batch(queries, { prepare: true, consistency: this.consistencyOptions['write'] })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update<T>(_data: PlainObject[], _condition: Condition<T>[], _tableName: string): Promise<void> {
    throw new NotImplementedException('update method not implemented for Cassandra Adaptor')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public delete(_condition: PlainObject, _tableName: string): Promise<void> {
    throw new NotImplementedException('delete method not implemented for Cassandra Adaptor')
  }

  public async raw(query: string, params: unknown[] = []): Promise<void> {
    await this.client.execute(query, params, { prepare: true })
  }
}
