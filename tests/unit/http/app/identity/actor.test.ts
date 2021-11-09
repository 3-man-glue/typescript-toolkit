import { IdentityException } from '@http-kit/exception/identity'
import { Actor } from '@http-kit/identity/actor'

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

    it('should throw when construct mandatory field with empty string', () => {
      expect(() => new Actor('', 'Actor user 1')).toThrow(IdentityException)
      expect(() => new Actor('user-1', '')).toThrow(IdentityException)
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
