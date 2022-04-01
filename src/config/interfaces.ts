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

export interface Dictionary {
  [key: string]: DictMapper
}

export interface ConfigInterface {
  resolve<T>(dict: Dictionary): T
}
