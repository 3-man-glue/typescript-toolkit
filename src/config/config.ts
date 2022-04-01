import { ConfigInterface, Dictionary, EnvType, DictType, DictMapper } from '@config/interfaces'
import { PlainObject } from '@utils/common-types'

export class ConfigService implements ConfigInterface {

  constructor(env: Record<string, unknown>) {
    process.env = { ...process.env, ...env as Record<string, string> }
  }

  public resolve<T>(dict: Dictionary): T {
    const config: PlainObject = {}

    for (const [ key, mapper ] of Object.entries(dict)) {
      const value = this.preprocess(mapper)

      if (mapper.type === DictType.NUMBER && typeof value === 'string') {
        const parsedValue = value.indexOf('.') < 0 ? parseInt(value, 10) : parseFloat(value)
        if (isNaN(parsedValue)) {
          throw new TypeError(`Environment ${mapper.env} variable value is not a number`)
        }
        config[key] = parsedValue
      } else if (mapper.type === DictType.ARRAY && typeof value === 'string') {
        config[key] = value.split(',').map(v => v.trim())
      } else if(mapper.type === DictType.BOOLEAN && typeof value === 'string') {
        if(value !== 'true' && value !== 'false') {
          throw new TypeError(`Environement ${mapper.env} is not boolean`)
        }

        config[key] = (value === 'true')
      } else {
        config[key] = value
      }
    }

    return config as T
  }

  private preprocess(mapper: DictMapper): EnvType {
    let value = process.env[mapper.env] ?? mapper.default

    if(value === undefined) {
      throw new Error(`Environment ${mapper.env} was not set, and it did not have a default value`)
    }

    if(typeof value === 'string') {
      value = value.trim()
    } else if( typeof value !== 'number' && typeof value !== 'boolean') {
      throw new Error(`Environment ${mapper.env} with type ${typeof value} is not supported`)
    }

    return value
  }
}
