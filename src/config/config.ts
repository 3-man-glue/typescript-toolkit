import { Service } from 'typedi'
import {
  HashAlgorithm,
  ConfigInterface,
  GatewayConfig,
  RedisOption,
  SecurityConfig,
  SendbirdConfig,
  GoogleCloudConfig,
  CassandraConfig
} from '@config/interfaces'

@Service()
export class ConfigService implements ConfigInterface {
  public readonly gateway: Readonly<GatewayConfig>

  public readonly googleCloud: Readonly<GoogleCloudConfig>

  public readonly redis: Readonly<RedisOption>

  public readonly sendbird: Readonly<SendbirdConfig>

  public readonly security: Readonly<SecurityConfig>

  public readonly cassandra: Readonly<CassandraConfig>

  constructor() {
    this.gateway = {
      baseEndpoint: process.env[ 'GATEWAY_BASE_ENDPOINT' ] ?? '',
      xApiKey: process.env[ 'GATEWAY_X_API_KEY' ] ?? '',
    }

    this.redis = {
      host: process.env[ 'REDIS_HOST' ] ?? '',
      port: process.env[ 'REDIS_PORT' ] ? parseInt(process.env[ 'REDIS_PORT' ], 10): 6379,
      url: process.env[ 'REDIS_URL' ],
      password: process.env[ 'REDIS_PASSWORD' ],
      timeToLive: process.env[ 'REDIS_TIME_TO_LIVE' ] ? parseInt(process.env[ 'REDIS_TIME_TO_LIVE' ], 10): 1,
    }

    this.sendbird = {
      baseEndpoint: process.env[ 'SENDBIRD_BASE_ENDPOINT' ] ?? '',
      appId: process.env[ 'SENDBIRD_APP_ID' ] ?? '',
      apiToken: process.env[ 'SENDBIRD_API_TOKEN' ] ?? '',
      botId: process.env[ 'SENDBIRD_BOT_ID' ] ?? '',
    }

    this.security = {
      hashAlgorithm: (process.env[ 'SERVER_SIDE_HASH_ALGORITHM' ] ?? 'sha256') as HashAlgorithm,
      serverSideKey: process.env[ 'SERVER_SIDE_KEY' ] ?? '',
    }

    this.googleCloud = {
      projectId: process.env[ 'GOOGLE_CLOUD_PROJECT' ] ?? '',
    }

    this.cassandra = {
      username: process.env['DATABASE_CASSANDRA_USERNAME'] ?? '',
      password: process.env['DATABASE_CASSANDRA_PASSWORD'] ?? '',
      keyspace: process.env['DATABASE_CASSANDRA_KEYSPACE'] ?? '',
      dataCenter: process.env['DATABASE_CASSANDRA_DATA_CENTER'] ?? '',
      contactPoints: ( process.env['DATABASE_CASSANDRA_CONTACT_POINTS'] ?? '' ).split(','),
    }
  }
}
