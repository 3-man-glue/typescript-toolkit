import cassandra from 'cassandra-driver'
import { CassandraEngine } from '@db/engine/cassandra-engine'
import { Operation } from '@db/interfaces'
import { CassandraConsistenciesString } from '@db/engine/interfaces'

jest.mock('cassandra-driver')

describe('CassandraEngine', () => {
  let cassandraEngine: CassandraEngine

  beforeEach(() => {
    const config = {
      username: 'username',
      password: 'password',
      keyspace: 'keyspace',
      dataCenter: 'dataCenter',
      contactPoints: [ 'contactPoints' ],
      readConsistency: 'localOne' as CassandraConsistenciesString,
      writeConsistency: 'quorum' as CassandraConsistenciesString,
    }

    cassandraEngine = new CassandraEngine(config)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return Instance of CassandraEngine', () => {
    expect(cassandraEngine).toBeInstanceOf(CassandraEngine)
    expect(cassandra.Client).toHaveBeenCalledTimes(1)
  })

  describe('select', () => {
    it('should call execute given valid input', async () => {
      await cassandraEngine.select({
        status: {
          [Operation.EQ]: 1,
        },
      }, 'broadcast')

      const mockClientInstance = (cassandra.Client as unknown as jest.Mock).mock.instances[0]
      expect(mockClientInstance.execute)
        .toHaveBeenCalledWith('SELECT * FROM broadcast WHERE status = ?', [ 1 ], { 'prepare': true })
    })
  })

  describe('insert', () => {
    it('should call batch given valid input', async () => {
      await cassandraEngine.insert([
        { status: 1 }
      ], 'broadcast')

      const mockClientInstance = (cassandra.Client as unknown as jest.Mock).mock.instances[0]
      expect(mockClientInstance.batch)
        .toHaveBeenCalledWith([
          { query: 'INSERT INTO broadcast (status) VALUES (?)', params: [ 1 ] }
        ], { 'prepare': true })
    })

    it('should throw error given empty data', async () => {
      await expect(cassandraEngine.insert([], 'broadcast')).rejects.toThrowError(
        'Data not provide'
      )
    })
  })
})
