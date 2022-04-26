import { ConfigService } from '@config/config'
import { DictType } from '@config/interfaces'

describe('Config Service', () => {
  let configService: ConfigService
  let originalEnv: NodeJS.ProcessEnv
  const additionalEnv = {
    ADDITIONAL_KEY: 'value',
    ADDITIONAL_KEY2: 'value2',
    PRESET_KEY: 'overwritten',
    INTEGER_AS_STRING: '999',
    INTEGER: 999,
    DECIMAL: '999.99',
    BOOLEAN: false,
    BOOLEAN_AS_STRING: 'true',
    STRING_LIST: 'a , b , c',
    NUMERIC_LIST: '1,23,45',
    INVALID_DECIMAL: 'v1.0.0',
    INVALID_INTEGER: 'Infinity',
    INVALID_BOOLEAN: '0',
    INVALID_TYPE: { k: 'v' },
  }

  beforeEach(() => {
    process.env[ 'PRESET_KEY' ] = 'preset-value'
    originalEnv = JSON.parse(JSON.stringify(process.env))
    configService = new ConfigService(additionalEnv)
    expect(process.env[ 'PRESET_KEY' ]).toBe('overwritten')
  })

  afterEach(() => {
    process.env = JSON.parse(JSON.stringify(originalEnv))
    expect(process.env[ 'PRESET_KEY' ]).toBe('preset-value')
  })

  describe('resolve', () => {
    it('should resolve when env variable is existing', () => {
      type Expected = { additionalKey: string }
      const dictionary = { additionalKey: { env: 'ADDITIONAL_KEY' } }
      const expectedConfig: Expected = { additionalKey: 'value' }

      const config = configService.resolve<Expected>(dictionary)

      expect(config).toStrictEqual<Expected>(expectedConfig)
    })

    it('should resolve default value when env variable does not exist', () => {
      type Expected = { additionalKey: string }
      const dictionary = { additionalKey: { env: 'ADDITIONAL_KEY_NOT_EXIST', default: 'default-value' } }
      const expectedConfig: Expected = { additionalKey: 'default-value' }

      const config = configService.resolve<Expected>(dictionary)

      expect(config).toStrictEqual<Expected>(expectedConfig)
    })

    it('should resolve integer string value as int when output type is NUMBER and value is not decimal', () => {
      type Expected = { additionalKey: number }
      const dictionary = { additionalKey: { env: 'INTEGER_AS_STRING', type: DictType.NUMBER } }
      const expectedConfig: Expected = { additionalKey: 999 }

      const config = configService.resolve<Expected>(dictionary)

      expect(config).toStrictEqual<Expected>(expectedConfig)
    })

    it('should resolve integer value as int when output type is NUMBER and value is not decimal', () => {
      type Expected = { additionalKey: number }
      const dictionary = { additionalKey: { env: 'INTEGER', type: DictType.NUMBER } }
      const expectedConfig: Expected = { additionalKey: 999 }

      const config = configService.resolve<Expected>(dictionary)

      expect(config).toStrictEqual<Expected>(expectedConfig)
    })

    it('should resolve decimal value as int when output type is NUMBER and value is decimal', () => {
      type Expected = { additionalKey: number }
      const dictionary = { additionalKey: { env: 'DECIMAL', type: DictType.NUMBER } }
      const expectedConfig: Expected = { additionalKey: 999.99 }

      const config = configService.resolve<Expected>(dictionary)

      expect(config).toStrictEqual<Expected>(expectedConfig)
    })

    it('should resolve boolean value as boolean', () => {
      type Expected = { additionalKey: boolean }
      const dictionary = { additionalKey: { env: 'BOOLEAN' } }
      const expectedConfig: Expected = { additionalKey: false }

      const config = configService.resolve<Expected>(dictionary)

      expect(config).toStrictEqual<Expected>(expectedConfig)
    })

    it('should resolve boolean string value as boolean when output type is BOOLEAN and value is not boolean', () => {
      type Expected = { additionalKey: boolean }
      const dictionary = { additionalKey: { env: 'BOOLEAN_AS_STRING', type: DictType.BOOLEAN } }
      const expectedConfig: Expected = { additionalKey: true }

      const config = configService.resolve<Expected>(dictionary)

      expect(config).toStrictEqual<Expected>(expectedConfig)
    })

    it('should resolve list of trimmed string when output type is ARRAY', () => {
      type Expected = { stringList: string[], numericList: string[] }
      const dictionary = {
        stringList: { env: 'STRING_LIST', type: DictType.ARRAY },
        numericList: { env: 'NUMERIC_LIST', type: DictType.ARRAY },
      }
      const expectedConfig: Expected = { stringList: [ 'a', 'b', 'c' ], numericList: [ '1', '23', '45' ] }

      const config = configService.resolve<Expected>(dictionary)

      expect(config).toStrictEqual<Expected>(expectedConfig)
    })

    it('should throw error when output type is NUMBER but no default value specified', () => {
      let isThrown = false
      try {
        const dictionary = {
          invalidDecimal: { env: 'INVALID_INTEGER', type: DictType.NUMBER },
        }

        configService.resolve(dictionary)
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(TypeError)
      }

      expect(isThrown).toBeTruthy()
    })

    it('should throw error when output type is NUMBER but default value is invalid', () => {
      let isThrown = false
      try {
        const dictionary = {
          invalidDecimal: { env: 'INVALID_INTEGER', default: '', type: DictType.NUMBER },
        }

        configService.resolve(dictionary)
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(TypeError)
      }

      expect(isThrown).toBeTruthy()
    })

    it('should throw error when env variable type is not a valid integer', () => {
      let isThrown = false
      try {
        const dictionary = {
          invalidDecimal: { env: 'INVALID_INTEGER', type: DictType.NUMBER },
        }

        configService.resolve(dictionary)
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(TypeError)
      }

      expect(isThrown).toBeTruthy()
    })

    it('should throw error when env variable type is not a valid decimal', () => {
      let isThrown = false
      try {
        const dictionary = {
          invalidDecimal: { env: 'INVALID_DECIMAL', type: DictType.NUMBER },
        }

        configService.resolve(dictionary)
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(TypeError)
      }

      expect(isThrown).toBeTruthy()
    })

    it('should throw error when env variable does not exist and default not specified', () => {
      let isThrown = false
      try {
        const dictionary = {
          nonExisted: { env: 'NON_EXISTED_ENV' },
        }

        configService.resolve(dictionary)
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(Error)
      }

      expect(isThrown).toBeTruthy()
    })

    it('should throw error when variable type is not boolean', () => {
      let isThrown = false
      try {
        const dictionary = {
          invalidBoolean: { env: 'INVALID_BOOLEAN', type: DictType.BOOLEAN },
        }

        configService.resolve(dictionary)
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(Error)
      }

      expect(isThrown).toBeTruthy()
    })

    it('should throw error when variable type is not supported', () => {
      let isThrown = false
      try {
        const dictionary = {
          invalidType: { env: 'INVALID_TYPE' },
        }

        configService.resolve(dictionary)
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(Error)
      }

      expect(isThrown).toBeTruthy()
    })

    it('should resolve a nested dictionary', () => {
      type Expected = {
        additionalKey: string
        additionalKey2: { additionalKey3: string }
      }
      const dictionary = {
        additionalKey: { env: 'ADDITIONAL_KEY' },
        additionalKey2: {
          additionalKey3: { env: 'ADDITIONAL_KEY2' },
        },
      }
      const expectedConfig: Expected = {
        additionalKey: 'value',
        additionalKey2: { additionalKey3: 'value2' },
      }

      const config = configService.resolve<Expected>(dictionary)

      expect(config).toStrictEqual<Expected>(expectedConfig)
    })
  })
})
