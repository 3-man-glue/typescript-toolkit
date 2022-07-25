import { IdentityException } from '@http-kit/exception/identity'
import { Identity, IdentityObject } from '@utils/common-types'

export class Actor implements Identity {
  public id: string

  public alias: string

  public externalId?: string

  constructor(id: string, alias: string, externalId?: string) {
    if (id.length < 1) { throw new IdentityException('Invalid ID. ID must not be an empty string.') }
    if (alias.length < 1) { throw new IdentityException('Invalid alias. Alias must not be an empty string.') }

    this.id = id
    this.alias = alias
    this.externalId = externalId
  }

  public toJSON(): Readonly<IdentityObject> {
    return Object.freeze({
      id: this.id,
      alias: this.alias,
      externalId: this.externalId,
    } as IdentityObject)
  }

  public toString(): string {
    return JSON.stringify(this.toJSON())
  }
}
