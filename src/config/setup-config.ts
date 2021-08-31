import dotenv from 'dotenv'
export function setupConfig(): void {
  const appEnv = process.env[ 'APP_ENV' ]
  const dotEnvPath = appEnv ? `.env.${appEnv}`: '.env.example'
  dotenv.config({ path: dotEnvPath })
}
