export type PlainObject = Record<string, unknown>

/**
 * Mark keys as optional
 *
 *  @typeParam T - Type of interface, object or things that has properties
 *  @typeParam K - Keys, attributes or properties that will be marked as optional
 *
 * @example
 * interface Todo {
 *   title: string;
 *   description: string;
 * }
 *
 * function update(fieldsToUpdate: PartialBy<Todo, 'description'>) {
 *   return { ...fieldsToUpdate }
 * }
 *
 * const todo = update({
 *   title: 'OKRs Check-ins',
 * })
 *
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
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
