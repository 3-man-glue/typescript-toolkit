import { PlainObject } from '@utils/common-types'
import { Engine } from '@db/engine/interfaces'
import { Condition, DataFactory, Query, Schema, State } from '@db/interfaces'

export abstract class Table<T extends State> implements DataFactory<T>, Query<T> {
  private name: string

  protected engine: Engine

  protected schema: Schema

  constructor(engine: Engine, schema: Schema, name: string) {
    this.engine = engine
    this.schema = schema
    this.name = name
  }

  public async select(condition: Condition<T>): Promise<T[]> {
    const recordDto = await this.engine.select(condition, this.name)

    return recordDto.map((record) => this.stateObjectFactory(record))
  }

  public async insert(recordState: T[]): Promise<void> {
    const recordDto = recordState.map((record) => this.plainObjectFactory(record))

    await this.engine.insert(recordDto, this.name)
  }

  public async update(recordState: T[], condition: Condition<T>): Promise<void> {
    const recordDto = recordState.map(record => this.plainObjectFactory(record))

    await this.engine.update(recordDto, condition, this.name)
  }

  public async delete(condition: Condition<T>): Promise<void> {
    await this.engine.delete(condition, this.name)
  }

  public abstract plainObjectFactory(state: T): PlainObject

  public abstract stateObjectFactory(object: PlainObject): T

}
