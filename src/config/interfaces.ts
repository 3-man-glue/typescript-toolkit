import { ClientOpts } from 'redis'

export type GoogleCloudConfig = {
  projectId: string
}

export type SendbirdConfig = {
  baseEndpoint: string
  appId: string
  apiToken: string
  botId: string
}

export type GatewayConfig = {
  baseEndpoint: string
  xApiKey: string
}

export interface RedisOption extends ClientOpts {
  timeToLive: number
}

export type HashAlgorithm = 'sha256'

export type SecurityConfig = {
  hashAlgorithm: HashAlgorithm
  serverSideKey: string
}

export type CassandraConfig = {
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
