import cassandra from 'cassandra-driver'
import { CassandraEngine } from '@db/engine/cassandra-engine'
import { Operation } from '@db/interfaces'
import { CassandraConsistenciesString, Engine } from '@db/engine/interfaces'
import { DBException } from '@http-kit/exception/db'

jest.mock('cassandra-driver')

describe('CassandraEngine', () => {
  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  const mockConfigService = {
    username: 'username',
    password: 'password',
    keyspace: 'keyspace',
    dataCenter: 'dataCenter',
    contactPoints: [ 'contactPoints' ],
    readConsistency: 'localOne' as CassandraConsistenciesString,
    writeConsistency: 'quorum' as CassandraConsistenciesString,
  }

  it('should return Instance of CassandraEngine', () => {
    const cassandraEngine: Engine = new CassandraEngine(mockConfigService, { write: 'quorum', read: 'localOne' })
    expect(cassandraEngine).toBeInstanceOf(CassandraEngine)
    expect(cassandra.Client).toHaveBeenCalledTimes(1)
  })

  describe('Read/Write consistency', () => {
    afterEach(() => {
      jest.resetModules()
      jest.clearAllMocks()
    })
    it('should throw error given not set read consistency', () => {
      let isThrown = false
      try {
        new CassandraEngine(mockConfigService, {
          write: 'quorum',
          read: undefined as unknown as CassandraConsistenciesString,
        })
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
        expect(error.message).toEqual('Invalid consistency')
      }

      expect(isThrown).toBeTruthy()
    })

    it('should throw error given set read consistency invalid value', () => {
      let isThrown = false
      try {
        new CassandraEngine(mockConfigService, {
          write: 'quorum',
          read: 'invalid-value' as unknown as CassandraConsistenciesString,
        })
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
        expect(error.message).toEqual('Invalid consistency')
      }

      expect(isThrown).toBeTruthy()
    })

    it('should use read consistency given ENV set valid', async () => {
      const cassandraEngine = new CassandraEngine(mockConfigService, {
        write: 'localOne',
        read: 'localOne',
      })
      await cassandraEngine.select(
        {
          status: {
            [Operation.EQ]: 1,
          },
        },
        'broadcast',
      )

      const mockClientInstance = (cassandra.Client as unknown as jest.Mock).mock.instances[0]
      expect(mockClientInstance.execute).toHaveBeenCalledWith('SELECT * FROM broadcast WHERE status = ?', [ 1 ], {
        prepare: true,
        consistency: cassandra.types.consistencies.localOne,
      })
    })

    it('should throw error given not set write consistency', () => {
      let isThrown = false
      try {
        new CassandraEngine(mockConfigService, {
          read: 'quorum',
          write: undefined as unknown as CassandraConsistenciesString,
        })
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
        expect(error.message).toBe('Invalid consistency')
      }

      expect(isThrown).toBeTruthy()
    })

    it('should throw error given set write consistency invalid value', () => {
      let isThrown = false
      try {
        new CassandraEngine(mockConfigService, {
          read: 'quorum',
          write: 'invalid-value' as unknown as CassandraConsistenciesString,
        })
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
        expect(error.message).toBe('Invalid consistency')
      }

      expect(isThrown).toBeTruthy()
    })

    it('should use write consistency given ENV set valid value', async () => {
      const cassandraEngine = new CassandraEngine(mockConfigService, {
        read: 'quorum',
        write: 'localOne',
      })
      await cassandraEngine.insert([ { status: 1 } ], 'broadcast')

      const mockClientInstance = (cassandra.Client as unknown as jest.Mock).mock.instances[0]
      expect(mockClientInstance.batch).toHaveBeenCalledWith(
        [ { query: 'INSERT INTO broadcast (status) VALUES (?)', params: [ 1 ] } ],
        { prepare: true, consistency: cassandra.types.consistencies.localOne },
      )
    })
  })

  describe('select', () => {
    it('should call execute given valid input', async () => {
      const cassandraEngine = new CassandraEngine(mockConfigService, {
        read: 'localOne',
        write: 'localOne',
      })
      await cassandraEngine.select(
        {
          status: {
            [Operation.EQ]: 1,
          },
        },
        'broadcast',
      )

      const mockClientInstance = (cassandra.Client as unknown as jest.Mock).mock.instances[0]
      expect(mockClientInstance.execute).toHaveBeenCalledWith('SELECT * FROM broadcast WHERE status = ?', [ 1 ], {
        prepare: true,
        consistency: cassandra.types.consistencies.localOne,
      })
    })
  })

  describe('concurrentSelect', () => {
    it('should call executeConcurrent', async () => {
      const cassandraEngine = new CassandraEngine(mockConfigService, {
        read: 'localOne',
        write: 'localOne',
      })
      jest.spyOn(cassandra.concurrent, 'executeConcurrent')
        .mockResolvedValueOnce( { errors: [], resultItems: [] } as unknown as cassandra.concurrent.ResultSetGroup)

      await cassandraEngine.concurrentSelect(
        [ {
          status: {
            [Operation.EQ]: 1,
          },
        } ],
        'broadcast',
      )

      expect(cassandra.concurrent.executeConcurrent).toHaveBeenCalledWith(
        expect.any(cassandra.Client), [ { query: 'SELECT * FROM broadcast WHERE status = ?', params: [ 1 ]  } ], {
          executionProfile: 'read-consistency',
          collectResults: true,
          concurrencyLevel: 50,
        })
    })

    it('should throw DBException given result has errors', async () => {
      const cassandraEngine = new CassandraEngine(mockConfigService, {
        read: 'localOne',
        write: 'localOne',
      })
      jest.spyOn(cassandra.concurrent, 'executeConcurrent')
        .mockResolvedValueOnce( { errors: [ new Error() ] } as unknown as cassandra.concurrent.ResultSetGroup)

      await expect(cassandraEngine.concurrentSelect([], 'broadcast')).rejects.toBeInstanceOf(DBException)
    })
  })

  describe('insert', () => {
    it('should call batch given valid input', async () => {
      const cassandraEngine = new CassandraEngine(mockConfigService, {
        read: 'quorum',
        write: 'localOne',
      })
      await cassandraEngine.insert([ { status: 1 } ], 'broadcast')

      const mockClientInstance = (cassandra.Client as unknown as jest.Mock).mock.instances[0]
      expect(mockClientInstance.batch).toHaveBeenCalledWith(
        [ { query: 'INSERT INTO broadcast (status) VALUES (?)', params: [ 1 ] } ],
        { prepare: true, consistency: cassandra.types.consistencies.localOne },
      )
    })

    it('should throw error given empty data', async () => {
      const cassandraEngine = new CassandraEngine(mockConfigService, {
        read: 'quorum',
        write: 'quorum',
      })
      await expect(cassandraEngine.insert([], 'broadcast')).rejects.toThrowError('Data not provide')
    })
  })

  describe('updateCounter', () => {
    it('should update value', async () => {
      const cassandraEngine = new CassandraEngine(mockConfigService, {
        read: 'quorum',
        write: 'localOne',
      })
      await cassandraEngine.updateCounter('Segment', 'SMT1202', 1)

      const mockClientInstance = (cassandra.Client as unknown as jest.Mock).mock.instances[0]
      expect(mockClientInstance.execute).toHaveBeenCalledWith(
        'UPDATE counter SET value = value + ? WHERE subject = ? AND subject_id = ?',
        [ 1, 'Segment', 'SMT1202' ],
        { prepare: true, consistency: cassandra.types.consistencies.localOne },
      )
    })
  })
})
