import fs from 'fs'
import dotenv from 'dotenv'

export function setupConfig(): Record<string, string> {
  const appEnv = process.env[ 'APP_ENV' ]
  const dotEnvPath = appEnv ? `.env.${appEnv}`: '.env.example'

  return dotenv.parse(fs.readFileSync( dotEnvPath ))
}
