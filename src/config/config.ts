import { ConfigInterface, Dictionary, DictType } from '@config/interfaces'
import { PlainObject } from '@utils/common-types'

export class ConfigService implements ConfigInterface {

  constructor(env: Record<string, string>) {
    process.env = { ...process.env, ...env }
  }

  public resolve<T>(dict: Dictionary): T {
    const config: PlainObject = {}

    for (const [ key, mapper ] of Object.entries(dict)) {
      const defaultValue = mapper.default ?? ''
      const value = process.env[mapper.env]?.trim() ?? defaultValue

      if (mapper.type === DictType.NUMBER && typeof value === 'string') {
        const parsedValue = value.indexOf('.') < 0 ? parseInt(value, 10) : parseFloat(value)
        if (isNaN(parsedValue)) {
          throw new TypeError('Environment variable value is not a number')
        }
        config[key] = parsedValue
      } else if (mapper.type === DictType.ARRAY && typeof value === 'string') {
        config[key] = value.split(',').map(v => v.trim())
      } else {
        config[key] = value
      }
    }

    return config as T
  }
}
