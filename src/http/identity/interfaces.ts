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
