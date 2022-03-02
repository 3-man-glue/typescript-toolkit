import { CassandraConsistenciesString } from '@db/engine/interfaces'
import { ClientOpts } from 'redis'

export enum DictType {
  NUMBER = 'number',
  ARRAY = 'array',
}
export interface DictMapper {
  env: string
  default?: string | number
  type?: string
}

export interface Dictionary {
  [key: string]: DictMapper
}

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

export type CassandraConfig = {
  username: string
  password: string
  keyspace: string
  dataCenter: string
  contactPoints: string[]
  readConsistency: CassandraConsistenciesString
  writeConsistency: CassandraConsistenciesString
}

export type PubSubConfig = {
  projectId: string
}

export type EventStreamConfig = {
  streamTopicName: string
  streamSubscriptionName: string
}

export interface ConfigInterface {
  resolve<T>(dict: Dictionary): T
}
