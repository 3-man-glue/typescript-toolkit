import { Get, Post } from '@http/app/handler/route-builder'
import { InternalServerException } from '@http/exception/internal-server'

describe('Route builder', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET builder', () => {
    it('should return unfinished build by default', () => {
      let isThrown = false
      try {
        Get({ path: '/path/to/something' }).build()
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(InternalServerException)
      }

      expect(isThrown).toBeTruthy()
    })

    it('should return new builder with GET method', () => {
      const api = { domain: 'domain', version: 'vX', path: '/path/to/something' }
      const route = Get(api).setContextMapper(jest.fn()).setChain(jest.fn()).build()

      expect(route.method).toBe('get')
      expect(route.path).toBe('/domain/vX/path/to/something')
    })
  })

  describe('POST builder', () => {
    it('should return unfinished build by default', () => {
      let isThrown = false
      try {
        Post({ path: '/path/to/something' }).build()
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(InternalServerException)
      }

      expect(isThrown).toBeTruthy()
    })

    it('should return new builder with POST method', () => {
      const api = { domain: 'domain', version: 'vX', path: '/path/to/something' }
      const route = Post(api).setContextMapper(jest.fn()).setChain(jest.fn()).build()

      expect(route.method).toBe('post')
      expect(route.path).toBe('/domain/vX/path/to/something')
    })
  })

  describe('builder', () => {
    it('should set /platform as a default domain path by default', () => {
      const route = Get({ path: '' }).setChain(jest.fn()).setContextMapper(jest.fn()).build()

      expect(route.path).toBe('/platform')
    })

    it('should throw when build without setup', () => {
      let isThrown = false
      try {
        Get({ path: '/path/to/something' }).build()
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(InternalServerException)
      }

      expect(isThrown).toBeTruthy()
    })

    it('should throw when build without context mapper', () => {
      let isThrown = false
      try {
        Get({ path: '' }).setChain(jest.fn()).build()
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(InternalServerException)
      }

      expect(isThrown).toBeTruthy()
    })

    it('should throw when build without handler chain', () => {
      let isThrown = false
      try {
        Get({ path: '' }).setContextMapper(jest.fn()).build()
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(InternalServerException)
      }

      expect(isThrown).toBeTruthy()
    })

    it('should throw when build with empty handler chain', () => {
      let isThrown = false
      try {
        Get({ path: '' }).setContextMapper(jest.fn()).setChain().build()
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(InternalServerException)
      }

      expect(isThrown).toBeTruthy()
    })
  })
})
