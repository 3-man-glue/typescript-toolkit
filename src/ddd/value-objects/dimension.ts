import { Dimension as DimensionInterface } from '@utils/common-types'

export class Dimension implements DimensionInterface {
  public height: number

  public width: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }

  public toString(): string {
    return `${this.height},${this.width}`
  }
}
