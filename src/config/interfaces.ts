import { PlainObject } from '@utils/common-types'

export type EnvType = string | number | boolean

export enum DictType {
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
}

export interface DictMapper {
  env: string
  default?: EnvType
  type?: string
}

export type DictValue = DictMapper | PlainObject

export interface Dictionary {
  [key: string]: DictValue
}

export interface ConfigInterface {
  resolve<T>(dict: Dictionary): T
}
