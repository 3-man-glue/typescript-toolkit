import 'reflect-metadata'
import { RedisOption, redisDictionary } from '@cache/interface'
import { ConfigService } from '@config/config'
import { setupConfig } from '@config/setup-config'
interface OtherConfigs {
  host: string
}

describe('Config Service', () => {
  let configService: ConfigService
  let originalEnv: Record<string, string>

  beforeEach(() => {
    const additionalEnv = setupConfig()
    originalEnv = JSON.parse(JSON.stringify(process.env))

    configService = new ConfigService(additionalEnv)
  })

  afterEach(() => {
    process.env = JSON.parse(JSON.stringify(originalEnv))
  })

  it('should resolve config properly', () => {
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
