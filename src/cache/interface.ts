import { ClientOpts } from 'redis'

export interface CacheInterface {
  get(key: string): Promise<string | undefined>
  set(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
  closeConnection(): void | Promise<void>
}

export interface RedisOption extends ClientOpts {
  timeToLive: number
}

export const redisDictionary = {
  host: {
    env: 'REDIS_HOST',
  },
  port: {
    env: 'REDIS_PORT',
    default: 6379,
    type: 'number',
  },
  url: {
    env: 'REDIS_URL',
  },
  password: {
    env: 'REDIS_PASSWORD',
  },
  timeToLive: {
    env: 'REDIS_TIME_TO_LIVE',
    default: 1,
    type: 'number',
  },
}
