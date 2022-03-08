export enum TimeUnit {
  DAY = 86400000,
  HOUR =  3600000,
  MINUTE = 60000,
  SECOND = 1000,
  MILLISECOND = 1
}

function convert(input: number, from: TimeUnit, to: TimeUnit): number {
  return input * (from / to)
}

export default { convert }
