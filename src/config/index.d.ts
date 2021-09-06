import { ClientOpts } from 'redis'
import {
  ConfigInterface,
  GatewayConfig,
  RedisOption,
  SecurityConfig,
  SendbirdConfig,
  GoogleCloudConfig,
  CassandraConfig
} from '@config/interfaces'
export declare class ConfigService implements ConfigInterface {
  readonly gateway: Readonly<GatewayConfig>

  readonly googleCloud: Readonly<GoogleCloudConfig>

  readonly redis: Readonly<RedisOption>

  readonly sendbird: Readonly<SendbirdConfig>

  readonly security: Readonly<SecurityConfig>

  readonly cassandra: Readonly<CassandraConfig>

  constructor()
}

export declare type GoogleCloudConfig = {
  projectId: string
}
export declare type SendbirdConfig = {
  baseEndpoint: string
  appId: string
  apiToken: string
  botId: string
}
export declare type GatewayConfig = {
  baseEndpoint: string
  xApiKey: string
}
export interface RedisOption extends ClientOpts {
  timeToLive: number
}
export declare type HashAlgorithm = 'sha256'
export declare type SecurityConfig = {
  hashAlgorithm: HashAlgorithm
  serverSideKey: string
}
export declare type CassandraConfig = {
  username: string
  password: string
  keyspace: string
  dataCenter: string
  contactPoints: string[]
}
export interface ConfigInterface {
  sendbird: Readonly<SendbirdConfig>
  redis: Readonly<RedisOption>
  security: Readonly<SecurityConfig>
  googleCloud: Readonly<GoogleCloudConfig>
  cassandra: Readonly<CassandraConfig>
}

export declare function setupConfig(): void
