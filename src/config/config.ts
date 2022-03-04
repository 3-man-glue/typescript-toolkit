import { Service } from 'typedi'
import { ConfigInterface, Dictionary, DictType } from '@config/interfaces'
import { PlainObject } from '@utils/common-types'

@Service()
export class ConfigService implements ConfigInterface {

  constructor(env: Record<string, string>) {
    process.env = { ...process.env, ...env }
  }

  public resolve<T>(dict: Dictionary): T {
    const config: PlainObject = {}

    for(const [ key, mapper ] of Object.entries(dict)){
      const defaultValue = mapper.default ?? ''
      const value = process.env[mapper.env] ?? defaultValue

      if(mapper.type === DictType.NUMBER && typeof value === 'string') {
        config[key] = parseInt(value, 10)
      }else if(mapper.type === DictType.ARRAY && typeof value === 'string') {
        config[key] = value.split(',')
      } else {
        config[key] = value
      }
    }

    return config as T
  }
}
