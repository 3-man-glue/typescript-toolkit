import redis, { RedisClient } from 'redis'
import { Service } from 'typedi'
import { promisify } from 'util'
import { Cache as CacheInterface, RedisOption } from './interface'
import { CacheException } from '@http/exception/cache'

@Service()
export class Redis implements CacheInterface {
  private readonly client: RedisClient

  private readonly timeToLive: number

  constructor(options: RedisOption) {
    this.client = redis.createClient(options)
    this.timeToLive = (60 * 60 * 24) * options.timeToLive
  }

  public async get(key: string): Promise<string | undefined> {
    const getCache = promisify(this.client.get).bind(this.client)
    let returnedValue = undefined

    try {
      returnedValue = await getCache(key) ?? undefined
    } catch (error) {
      throw new CacheException('Redis get cache exception')
        .withInput({ key })
        .withCause(error)
    }

    return returnedValue
  }

  public async set(key: string, value: string): Promise<void> {
    const setCache = promisify<string, string, string, number>(this.client.set).bind(this.client)

    try {
      await setCache(key, value, 'EX', this.timeToLive)
    } catch (error) {
      throw new CacheException('Redis set cache exception')
        .withInput({ key, value })
        .withCause(error)
    }
  }

  public delete(key: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client.del(key, (error, result) => {
        const cacheError = new CacheException('Cannot delete the given key').withInput({ key })

        if(error) {
          return reject(cacheError.withCause(error))
        }

        if(!result) {
          return reject(cacheError)
        }

        resolve()
      })
    })
  }

  public closeConnection(): void {
    this.client.end()
  }
}
