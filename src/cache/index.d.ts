import redis from 'redis'
export class Redis {
  constructor(options: RedisOption)

  public get(key: string): Promise<string | undefined>

  public set(key: string, value: string): Promise<void>

  public delete(key: string): Promise<void>

  public closeConnection(): void
}

export interface Cache {
  get(key: string): Promise<string | undefined>
  set(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
  closeConnection(): void | Promise<void>
}

export interface RedisOption extends redis.ClientOpts {
  timeToLive: number
}
