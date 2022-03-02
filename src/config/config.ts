import { Service } from 'typedi'
import { ConfigInterface, Dictionary, DictMapper, DictType } from '@config/interfaces'
import { setupConfig } from '@config/setup-config'
import { PlainObject } from '@utils/common-types'

@Service()
export class ConfigService implements ConfigInterface {

  constructor() {
    setupConfig()
  }

  public resolve<T>(dict: Dictionary): T {
    const config: PlainObject = {}

    Object.keys(dict).forEach(key => {
      const mapper = dict[ key ] as DictMapper
      const defaultValue = mapper.default ?? ''
      const value = process.env[mapper.env] ?? defaultValue

      if(mapper.type === DictType.NUMBER && typeof value === 'string') {
        config[key] = parseInt(value, 10)
      }else if(mapper.type === DictType.ARRAY && typeof value === 'string') {
        config[key] = value.split(',')
      } else {
        config[key] = value
      }
    })

    return config as T
  }
}
