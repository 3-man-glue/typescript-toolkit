import generateCuid from 'cuid'
import { nanoid as generateNanoId } from 'nanoid'

interface PrefixOptions {
  value: string
  delimiter?: string
}

function cuid(prefix?: PrefixOptions): string {
  return generatePrefix(prefix) + generateCuid()
}

function nanoid(length?: number, prefix?: PrefixOptions): string {
  return generatePrefix(prefix) + generateNanoId(length)
}

function generatePrefix(options?: PrefixOptions): string {
  return options && options.value && options.value.trim().length
    ? options.value.trim() + (options.delimiter?.trim().length ? options.delimiter.trim() : ':')
    : ''
}

export default { cuid, nanoid }
