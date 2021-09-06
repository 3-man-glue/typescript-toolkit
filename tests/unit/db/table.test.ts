import { PlainObject } from '@utils/common-types'
import { Engine } from '@db/engine/interfaces'
import { Operation, Schema, State } from '@db/interfaces'
import { Table } from '@db/table'
import { DBException } from '@http/exception/db'

interface TestState extends State {
  attrA: string,
  attrB: string[],
  attrC: number,
  attrD: { key1: string, key2: number, key3: boolean, key4: Date }
}

interface TestSchema extends Schema {
  attrA: string,
  attrB: string,
  attrC: string,
  attrD: string,
}

class ConcreteTable<T extends TestState> extends Table<T> {
  constructor(engine: Engine) {
    const testSchema: TestSchema = {
      attrA: 'column_a',
      attrB: 'column_b',
      attrC: 'column_c',
      attrD: 'column_d',
    }

    super(engine, testSchema, 'ConcreteTable')
  }

  public plainObjectFactory(state: T): PlainObject {
    const recordState: PlainObject =  {}

    for (const [ key, value ] of Object.entries(this.schema)) {
      recordState[value] = state[key as keyof T]
    }

    return recordState
  }

  public stateObjectFactory(object: PlainObject): T {
    const recordDto: PlainObject =  {}

    for (const [ key, value ] of Object.entries(this.schema)) {
      recordDto[key] = object[value]
    }

    return recordDto as T
  }
}

const recordDto = [ {
  'column_a': 'a1',
  'column_b': [ 'b1-1', 'b1-2' ],
  'column_c': 1001,
  'column_d': { key1: 'value-d1', key2: 2001, key3: true, key4: new Date(2021, 0O1, 0O1) },
}, {
  'column_a': 'a2',
  'column_b': [ 'b2-1', 'b2-2' ],
  'column_c': 1002,
  'column_d': { key1: 'value-d2', key2: 2002, key3: false, key4: new Date(2021, 0O2, 0O2) },
} ]

const recordState = [ {
  attrA: 'a1',
  attrB: [ 'b1-1', 'b1-2' ],
  attrC: 1001,
  attrD: { key1: 'value-d1', key2: 2001, key3: true, key4: new Date(2021, 0O1, 0O1) },
}, {
  attrA: 'a2',
  attrB: [ 'b2-1', 'b2-2' ],
  attrC: 1002,
  attrD: { key1: 'value-d2', key2: 2002, key3: false, key4: new Date(2021, 0O2, 0O2) },
} ] as TestState[]

describe('Table Abstract', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('select', () => {
    it('should return an object which is an instance of state', async () => {
      const mockEngine = {
        select: jest.fn().mockReturnValue(recordDto),
      } as unknown as Engine
      const tableUnderTest = new ConcreteTable(mockEngine)

      const result = await tableUnderTest.select({ attrA: { order: 'asc' } })

      expect(result).toStrictEqual(recordState)
      expect(mockEngine.select).toBeCalledWith({ attrA: { order: 'asc' } }, 'ConcreteTable')
    })

    it('should throw an error when engine cannot select the given condition', async () => {
      const mockEngine = {
        select: jest.fn().mockRejectedValueOnce(new DBException('select-error')),
      } as unknown as Engine
      const tableUnderTest = new ConcreteTable(mockEngine)
      let isThrown = false

      try {
        await tableUnderTest.select({})
      } catch (e) {
        isThrown = true

        expect(e).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
    })
  })

  describe('insert', () => {
    it('Should insert the given records properly', async () => {
      const mockEngine = {
        insert: jest.fn(),
      } as unknown as Engine
      const tableUnderTest = new ConcreteTable(mockEngine)

      await tableUnderTest.insert(recordState)

      expect(mockEngine.insert).toBeCalledWith(recordDto, 'ConcreteTable')
      expect(mockEngine.insert).toBeCalledTimes(1)
    })

    it('should throw an error when engine cannot insert the given condition', async () => {
      const mockEngine = {
        insert: jest.fn().mockRejectedValueOnce(new DBException('insert-error')),
      } as unknown as Engine
      const tableUnderTest = new ConcreteTable(mockEngine)
      let isThrown = false

      try {
        await tableUnderTest.insert(recordState)
      } catch (e) {
        isThrown = true

        expect(e).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
    })
  })

  describe('update', () => {
    it('Should update the given records properly', async () => {
      const mockEngine = {
        update: jest.fn(),
      } as unknown as Engine
      const tableUnderTest = new ConcreteTable(mockEngine)

      await tableUnderTest.update(recordState, { attrA: { order: 'asc' } })

      expect(mockEngine.update).toBeCalledWith(recordDto, { attrA: { order: 'asc' } }, 'ConcreteTable')
    })

    it('should throw an error when engine cannot update the given records', async () => {
      const mockEngine = {
        update: jest.fn().mockRejectedValueOnce(new DBException('update-error')),
      } as unknown as Engine
      const tableUnderTest = new ConcreteTable(mockEngine)
      let isThrown = false

      try {
        await tableUnderTest.update(recordState, { attrA: { order: 'asc' } })
      } catch (e) {
        isThrown = true

        expect(e).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
    })
  })

  describe('delete', () => {
    it('Should delete the given condition properly', async () => {
      const mockEngine = {
        delete: jest.fn(),
      } as unknown as Engine
      const tableUnderTest = new ConcreteTable(mockEngine)

      await tableUnderTest.delete({ attrA: { [Operation.EQ]: 'a1' } })

      expect(mockEngine.delete).toBeCalledWith({ attrA: { [Operation.EQ]: 'a1' } }, 'ConcreteTable')
      expect(mockEngine.delete).toBeCalledTimes(1)
    })

    it('should throw an error when engine cannot update the given condition', async () => {
      const mockEngine = {
        delete: jest.fn().mockRejectedValueOnce(new DBException('delete-error')),
      } as unknown as Engine
      const tableUnderTest = new ConcreteTable(mockEngine)
      let isThrown = false

      try {
        await tableUnderTest.delete({ attrA: { [Operation.EQ]: 'a1' } })
      } catch (e) {
        isThrown = true

        expect(e).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
    })
  })
})
