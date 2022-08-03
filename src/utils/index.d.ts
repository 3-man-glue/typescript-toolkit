import { ObjectSchema } from 'joi'
import { Logger as WinstonLogger } from 'winston'
export declare type Logger = WinstonLogger

interface PrefixOptions {
  value: string
  delimiter?: string
}

declare function cuid(prefix?: PrefixOptions): string
declare function nanoid(length?: number, prefix?: PrefixOptions): string
declare const IdGenerator: {
    cuid: typeof cuid;
    nanoid: typeof nanoid;
}
declare const logger: WinstonLogger
export declare type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export declare type DataValidator = {
  params?: PlainObject
  body?: PlainObject
  query?: PlainObject
}

export declare type PlainObject = Record<string, unknown>
export interface Dimension {
  height: number
  width: number
  toString(): string
}
export interface IdentityObject {
  id: string
  alias: string
  externalId: string
}
export interface Identity {
  id: string
  alias: string
  externalId?: string
  toJSON(): Readonly<IdentityObject>
  toString(): string
}
