import IdGen from '@utils/id-generator'
import { nanoid } from 'nanoid'

jest.mock('cuid', () => jest.fn().mockReturnValue('cuid'))
jest.mock('nanoid', () => ({ nanoid: jest.fn().mockReturnValue('nanoid') }))

describe('Id Generator', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe('cuid', () => {
    it('should generate id without prefix', () => {
      const id = IdGen.cuid()

      expect(id).toBe('cuid')
    })

    it('should generate id with prefix and default delimiter', () => {
      const id = IdGen.cuid({ value: 'pref' })

      expect(id).toBe('pref:cuid')
    })

    it('should generate id with prefix and delimiter', () => {
      const id = IdGen.cuid({ value: ' pref ', delimiter: ' | ' })

      expect(id).toBe('pref|cuid')
    })

    it('should generate id with prefix and fallback delimiter', () => {
      const id = IdGen.cuid({ value: ' pref ', delimiter: '  ' })

      expect(id).toBe('pref:cuid')
    })

    it('should generate id without prefix when provide invalid prefix', () => {
      const id = IdGen.cuid({ value: ' ', delimiter: '|' })

      expect(id).toBe('cuid')
    })

    it('should generate id with prefix and fallback delimiter when provide invalid delimiter', () => {
      const id = IdGen.cuid({ value: ' pref ', delimiter: '   ' })

      expect(id).toBe('pref:cuid')
    })
  })

  describe('nanoid', () => {
    it('should generate id without prefix', () => {
      const id = IdGen.nanoid()

      expect(id).toBe('nanoid')
    })

    it('should generate id with specific length but without prefix', () => {
      const id = IdGen.nanoid(999)

      expect(id).toBe('nanoid')
      expect(nanoid).toHaveBeenCalledTimes(1)
      expect(nanoid).toHaveBeenCalledWith(999)
    })

    it('should generate id with default length and specific prefix', () => {
      const id = IdGen.nanoid(undefined, { value: ' pref ', delimiter: ' | ' })

      expect(id).toBe('pref|nanoid')
      expect(nanoid).toHaveBeenCalledTimes(1)
      expect(nanoid).toHaveBeenCalledWith(undefined)
    })

    it('should generate id with prefix and default delimiter', () => {
      const id = IdGen.nanoid(10, { value: 'pref' })

      expect(id).toBe('pref:nanoid')
      expect(nanoid).toHaveBeenCalledTimes(1)
      expect(nanoid).toHaveBeenCalledWith(10)
    })

    it('should generate id with prefix and fallback delimiter', () => {
      const id = IdGen.nanoid(10, { value: ' pref ', delimiter: '  ' })

      expect(id).toBe('pref:nanoid')
      expect(nanoid).toHaveBeenCalledTimes(1)
      expect(nanoid).toHaveBeenCalledWith(10)
    })

    it('should generate id without prefix when provide invalid prefix', () => {
      const id = IdGen.nanoid(10, { value: ' ', delimiter: '|' })

      expect(id).toBe('nanoid')
      expect(nanoid).toHaveBeenCalledTimes(1)
      expect(nanoid).toHaveBeenCalledWith(10)
    })

    it('should generate id with prefix and fallback delimiter when provide invalid delimiter', () => {
      const id = IdGen.nanoid(10, { value: ' pref ', delimiter: '   ' })

      expect(id).toBe('pref:nanoid')
      expect(nanoid).toHaveBeenCalledTimes(1)
      expect(nanoid).toHaveBeenCalledWith(10)
    })
  })
})
