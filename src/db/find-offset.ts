export function findOffset(numbers: number[], key: number): number {
  let low = 0
  let mid = 0
  let high = numbers.length - 1
  while (low <= high) {
    mid = Math.floor((low + high) / 2)
    const midNumber = numbers[mid] as number
    const lowNumber = numbers[low] as number
    const highNumber = numbers[high] as number

    if (midNumber === key) {
      return mid + 1
    }

    if (lowNumber >= key) {
      return low + 1
    }

    if (highNumber <= key) {
      return high + 1
    }

    if (high - low === 1) {
      return high + 1
    }

    if (key > midNumber) {
      low = mid
    } else {
      high = mid
    }
  }

  return high + 1
}
