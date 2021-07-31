import { ClientOpts } from 'redis'

export interface Cache {
  get(key: string): Promise<string | undefined>
  set(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
}

export interface RedisOption extends ClientOpts {
  timeToLive: number
}
