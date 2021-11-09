import { Anonymous } from '@http-kit/identity/anonymous'

describe('Anonymous', () => {

  it('should construct attributes properly', () => {
    const instance = new Anonymous()

    expect(instance.id).toBe('anonymous')
    expect(instance.alias).toBe('Anonymous user')
    expect(instance.externalId).toBeUndefined()
  })
})
