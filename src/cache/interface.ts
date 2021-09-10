export interface CacheInterface {
  get(key: string): Promise<string | undefined>
  set(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
  closeConnection(): void | Promise<void>
}
