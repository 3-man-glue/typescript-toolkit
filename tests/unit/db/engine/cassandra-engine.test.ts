import { Container } from 'typedi'
import 'reflect-metadata'
import cassandra from 'cassandra-driver'
import { CassandraEngine } from 'libs/db/engine/cassandra-engine'
import { Operation } from 'libs/db/interfaces'
jest.mock('cassandra-driver')

afterAll(() => {
  Container.reset()
})

describe('CassandraEngine', () => {

  it('should return Instance of CassandraEngine', () => {
    const cassandraEngine: CassandraEngine = Container.get(CassandraEngine)
    expect(cassandraEngine).toBeInstanceOf(CassandraEngine)
    expect(cassandra.Client).toHaveBeenCalledTimes(1)
  })

  describe('select', () => {
    it('should call execute given valid input', async () => {
      const cassandraEngine: CassandraEngine = Container.get(CassandraEngine)
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
      const cassandraEngine: CassandraEngine = Container.get(CassandraEngine)
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
      const cassandraEngine: CassandraEngine = Container.get(CassandraEngine)
      await expect(cassandraEngine.insert([], 'broadcast')).rejects.toThrowError(
        'Data not provide'
      )
    })
  })
})
