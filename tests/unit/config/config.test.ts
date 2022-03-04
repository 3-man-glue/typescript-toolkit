import 'reflect-metadata'
import Container from 'typedi'
import { redisDictionary } from '@cache/interface'
import { ConfigService } from '@config/config'
import { RedisOption } from '@config/interfaces'

interface OtherConfigs {
  host: string
}

describe('Config Service', () => {
  let configService: ConfigService

  beforeEach(() => {
    configService = Container.get(ConfigService)
  })

  // should unskip this on update config service
  it.skip('should resolve config properly', () => {
    const expectedConfig = {
      host: '127.0.0.1',
      port: 6379,
      url: 'redis://example.com/',
      password: 'password',
      timeToLive: 10,
    }
    const config = configService.resolve<RedisOption>(redisDictionary)

    expect(config).toStrictEqual(expectedConfig)
  })

  it('should resolve other configs', () => {
    process.env['OTHERS_CONFIG'] = 'testing-value'
    const dictionary = {
      host: {
        env: 'OTHERS_CONFIG',
      },
    }
    const expectedConfig = {
      host: 'testing-value',
    }

    const config = configService.resolve<OtherConfigs>(dictionary)

    expect(config).toStrictEqual(expectedConfig)
  })
})
