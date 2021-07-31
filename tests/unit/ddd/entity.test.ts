import { DomainState } from '@ddd/interfaces'
import { Entity } from '@ddd/entity'

jest.mock('@utils/id-generator', () => ({ cuid: jest.fn().mockReturnValue('random-cuid') }))

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
    testEntity = new ConcreteEntity(defaultTestState)
  })

  describe('Constructor', () => {
    it('Should constructor with at least random id', () => {
      const expectedState = { id: 'random-cuid' }
      const testEntity = new ConcreteEntity()

      expect(testEntity.getState()).toStrictEqual(expectedState)
    })

    it('Should constructor with whole state', () => {
      const expectedState = { id: 'id-a', attrA: 'value', attrB: 111111, attrC: true }
      const testEntity = new ConcreteEntity({ id: 'id-a', attrA: 'value', attrB: 111111, attrC: true })

      expect(testEntity.getState()).toStrictEqual(expectedState)
    })
  })

  describe('Getter', () => {
    it('Should return id', () => {
      expect(testEntity.id).toBe('entity-id')
    })

    it('Should return entity state', () => {
      const expectedState = { id: 'entity-id', attrA: 'attribute-a', attrB: 999999, attrC: true }

      expect(testEntity.getState()).toStrictEqual(expectedState)
    })
  })

  describe('State modification', () => {
    it('Should set state with whole state except its id', () => {
      const expectedState = { id: 'entity-id', attrA: 'new-value', attrB: 10000, attrC: false }

      testEntity.setStateProxy()

      expect(testEntity.getState()).toStrictEqual(expectedState)
    })

    it('Should path state with partial state except its id', () => {
      const expectedState = { id: 'entity-id', attrA: 'attribute-a', attrB: NaN, attrC: true }

      testEntity.patchStateProxy()

      expect(testEntity.getState()).toStrictEqual(expectedState)
    })
  })
})
