export type PlainObject = Record<string, unknown>

export interface Dimension {
  height: number,
  width: number,
  toString(): string,
}

export interface IdentityObject {
  id: string,
  alias: string,
  externalId: string,
}

export interface Identity {
  id: string,
  alias: string,
  externalId?: string,

  toJSON(): Readonly<IdentityObject>,

  toString(): string,
}
