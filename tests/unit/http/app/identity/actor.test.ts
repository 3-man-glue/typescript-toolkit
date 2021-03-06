import { IdentityException } from '@http-kit/exception/identity'
import { Actor } from '@http-kit/app/identity/actor'

describe('Actor', () => {

  describe('constructor', () => {
    it('should create a new instance properly', () => {
      const instance = new Actor('user-0', 'Actor user 0', 'u-0')

      expect(instance.id).toBe('user-0')
      expect(instance.alias).toBe('Actor user 0')
      expect(instance.externalId).toBe('u-0')
    })

    it('should create a new instance with the default value', () => {
      const instance = new Actor('user-1', 'Actor user 1')

      expect(instance.id).toBe('user-1')
      expect(instance.alias).toBe('Actor user 1')
      expect(instance.externalId).toBeUndefined()
    })

    it('should throw when construct first mandatory field with empty string', () => {
      let isThrow = false

      try {
        new Actor('', 'Actor user 1')
      } catch (error) {
        isThrow = true
        expect(error).toBeInstanceOf(IdentityException)
      }
      expect(isThrow).toBeTruthy()
    })

    it('should throw when construct second mandatory field with empty string', () => {
      let isThrow = false

      try {
        new Actor('user-1', '')
      } catch (error) {
        expect(error).toBeInstanceOf(IdentityException)
        isThrow = true
      }
      expect(isThrow).toBeTruthy()
    })
  })

  describe('toJSON()', () => {

    it('should return attributes as immutable JSON object', () => {
      const expectedResult = {
        id: 'user-2',
        alias: 'Actor user 2',
        externalId: 'u-2',
      }
      const instance = new Actor('user-2', 'Actor user 2', 'u-2')

      const result = instance.toJSON()

      expect(result).toStrictEqual(expectedResult)
      expect(Object.isFrozen(result)).toBeTruthy()
    })
  })

  describe('toString()', () => {
    it('should return string of attributes', () => {
      const expectedResult = JSON.stringify({
        id: 'user-3',
        alias: 'Actor user 3',
        externalId: 'u-3',
      })
      const instance = new Actor('user-3', 'Actor user 3', 'u-3')

      const result = instance.toString()

      expect(result).toStrictEqual(expectedResult)
    })
  })
})
