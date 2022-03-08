import { DomainState } from '@ddd/interfaces'
import { Entity } from '@ddd/entity'

jest.mock('cuid', () => jest.fn().mockReturnValue('random-cuid'))

describe('Entity Abstraction', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  interface TestState extends DomainState {
    attrA: string
    attrB: number
    attrC: boolean
  }

  class ConcreteEntity extends Entity<TestState> {
    setStateProxy(): void {
      this.setState({ attrA: 'new-value', attrB: 10000, attrC: false })
    }

    patchStateProxy(): void {
      this.patchState({ attrB: NaN })
    }
  }

  let testEntity: ConcreteEntity
  let defaultTestState: TestState

  beforeEach(() => {
    defaultTestState = { id: 'entity-id', attrA: 'attribute-a', attrB: 999999, attrC: true }
    testEntity = new ConcreteEntity({ state: defaultTestState })
  })

  describe('Constructor', () => {
    it('Should constructor with at least random id', () => {
      const expectedState = { id: 'random-cuid' }
      const testEntity = new ConcreteEntity()

      expect(testEntity.getState()).toStrictEqual(expectedState)
    })

    it('Should constructor with whole state', () => {
      const expectedState = { id: 'id-a', attrA: 'value', attrB: 111111, attrC: true }
      const testEntity = new ConcreteEntity({ state: { id: 'id-a', attrA: 'value', attrB: 111111, attrC: true } })

      expect(testEntity.getState()).toStrictEqual(expectedState)
    })

    it('should able to prefix the generated id', () => {
      class TestEntity extends Entity<TestState> {
        constructor() {
          super({ idPrefix: 'PREFIX' })
        }
      }

      const testEntity = new TestEntity()

      expect(testEntity.id).toBe('PREFIX:random-cuid')
    })

    it('should ignore when the prefix is defined with empty string', () => {
      class TestEntity extends Entity<TestState> {
        constructor() {
          super({ idPrefix: '' })
        }
      }

      const testEntity = new TestEntity()

      expect(testEntity.id).toBe('random-cuid')
    })

    it('should ignore when id is provided whether prefix is defined', () => {
      class TestEntity extends Entity<TestState> {
        constructor(state: TestState) {
          super({ state, idPrefix: 'PREFIX' })
        }
      }

      const expectedState = { id: 'id-a', attrA: 'value', attrB: 111111, attrC: true }
      const testEntity = new TestEntity(expectedState)

      expect(testEntity.getState()).toStrictEqual(expectedState)
    })
  })

  describe('Getter', () => {
    it('should return id', () => {
      expect(testEntity.id).toBe('entity-id')
    })

    it('should return entity state', () => {
      const expectedState = { id: 'entity-id', attrA: 'attribute-a', attrB: 999999, attrC: true }

      expect(testEntity.getState()).toStrictEqual(expectedState)
    })
  })

  describe('State modification', () => {
    it('should set state with whole state except its id', () => {
      const expectedState = { id: 'entity-id', attrA: 'new-value', attrB: 10000, attrC: false }

      testEntity.setStateProxy()

      expect(testEntity.getState()).toStrictEqual(expectedState)
    })

    it('should path state with partial state except its id', () => {
      const expectedState = { id: 'entity-id', attrA: 'attribute-a', attrB: NaN, attrC: true }

      testEntity.patchStateProxy()

      expect(testEntity.getState()).toStrictEqual(expectedState)
    })
  })
})
