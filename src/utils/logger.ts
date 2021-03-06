import ecsFormat from '@elastic/ecs-winston-format'
import { createLogger, transports, format, Logger as WinstonLogger } from 'winston'
import { join } from 'path'

const logFileName = (name: string): string => {
  const logFilePath = join(process.cwd(), 'data/log/')
  const env = process.env['APP_ENV'] ?? 'local'

  return join(logFilePath, `${name}.${env}.log`)
}

export default createLogger({
  level: process.env['APP_ENV'] === 'development' ? 'debug' : 'info',
  transports:
    [ 'local', 'test', 'integration' ].includes(process.env['APP_ENV'] ?? 'local')
      ? [
        new transports.Console(),
        new transports.File({ filename: logFileName('app') }),
        new transports.File({ filename: logFileName('error'), level: 'error' }),
      ]
      : [ new transports.Console() ],
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.printf((info) => `[${info['timestamp']}] - ${info.level}: ${info.message}`),
    ecsFormat(),
  ),
})

export type Logger = WinstonLogger
