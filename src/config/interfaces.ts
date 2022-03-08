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

export interface ConfigInterface {
  resolve<T>(dict: Dictionary): T
}
