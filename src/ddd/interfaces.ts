/**
 *  ## UseCase interface
 *   - Represent only one domain use-case in particular bounded-context
 *   - Entrypoint execution via `execute<T, K>(input: T): UseCaseOutput<K>` method
 *      - `T` is type or interface of Input Value or void if no param
 *      - `K` is type or interface of Output Value or void if no output
 *      - `K` can be Promise of K
 *
 *  ### Usage Example:
 *  ```
 *  class DoSomething implement UseCase {
 *    execute(): void {
 *      process.resourceUsage()
 *    }
 *  }
 *  class DoSomethingWithInput implement UseCase<string> {
 *    execute(input: string): void {
 *      console.log(input)
 *    }
 *  }
 *  class DoSomethingWithInputAndOutput implement UseCase<string, number> {
 *    execute(input: string): number {
 *      return parseInt(input, 10)
 *    }
 *  }
 *  class DoSomethingWithOutput implement UseCase<void, number> {
 *    execute(): number {
 *      return 10
 *    }
 *  }
 *  ```
 */

import { Identity, PlainObject } from '@utils/common-types'

export interface UseCase<T = void, K = void> {
  execute(input: T): K | Promise<K>
}

export interface EntityInterface<T extends DomainState> {
  id: string

  getState(): Readonly<T>
}

export interface DomainEventInterface<T extends DomainState, K extends EventParams = Record<string, unknown>> {
  id: Readonly<string>
  subject: Readonly<string>
  subjectId: Readonly<string>
  action: Readonly<string>
  actor: Readonly<Identity>
  timestamp: Readonly<number>
  params: Readonly<K>
  context: EventContext<T>
  toJSON(): PlainObject
}

export interface DomainState {
  id: string
}

export type EventContext<T extends DomainState> = {
  subjectState: T
  [ key: string ]: unknown
}

export type EventParams = Record<string, unknown>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventConstructor<T extends DomainState, K extends EventParams> = new (
  ...args: any[]
) => DomainEventInterface<T, K>

export interface EventEmitter<T extends DomainState> {
  emit<K extends EventParams = Record<string, unknown>>(Event: EventConstructor<T, K>, params?: K): this

  commit(): DomainEventInterface<T>[]
}

export interface Publisher<T extends DomainState> {
  publish(event: EventEmitter<T>, topic: string): Promise<void>
}
