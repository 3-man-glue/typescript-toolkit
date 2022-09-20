import { ClientOpts } from 'redis'
import {
  ConfigInterface,
  GatewayConfig,
  RedisOption,
  SecurityConfig,
  SendbirdConfig,
  GoogleCloudConfig,
  CassandraConfig,
  PubSubConfig,
  EventStreamConfig,
  VideoConfig
} from './config/interfaces.ts'

export declare class ConfigService implements ConfigInterface {
  readonly gateway: Readonly<GatewayConfig>

  readonly googleCloud: Readonly<GoogleCloudConfig>

  readonly redis: Readonly<RedisOption>

  readonly sendbird: Readonly<SendbirdConfig>

  readonly security: Readonly<SecurityConfig>

  readonly cassandra: Readonly<CassandraConfig>

  readonly pubSub: Readonly<PubSubConfig>

  readonly eventStream: Readonly<EventStreamConfig>

  readonly video: Readonly<VideoConfig>

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

export declare type EventTopic = {
  batch: string,
  broadcast: string,
  segment: string,
  user: string,
}

export declare type PubSubConfig = {
  projectId: string
  topics: EventTopic
}

export declare type EventStreamConfig = {
  streamTopicName: string
  streamSubscriptionName: string
}

export declare type VideoConfig = {
  width: number
}

export interface ConfigInterface {
  sendbird: Readonly<SendbirdConfig>
  redis: Readonly<RedisOption>
  security: Readonly<SecurityConfig>
  googleCloud: Readonly<GoogleCloudConfig>
  cassandra: Readonly<CassandraConfig>
  pubSub: Readonly<PubSubConfig>
  eventStream: Readonly<EventStreamConfig>
  video: Readonly<VideoConfig>
}

export declare function setupConfig(): void
