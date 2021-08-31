import { SecretManagerServiceClient } from '@google-cloud/secret-manager'
import logger from '@utils/logger'
export async function setupSecretManager(): Promise<void> {
  const client = new SecretManagerServiceClient()
  const gcpProjectId = process.env['GCP_PROJECT_ID']
  const secretName = process.env['GCP_SECRET_NAME']
  try {
    const [ secret ] = await client.accessSecretVersion({
      name: `projects/${gcpProjectId}/secrets/${secretName}/versions/latest`,
    })
    const secretValue = secret.payload?.data
      ? JSON.parse(secret.payload.data.toString())
      : {}

    process.env = { ...process.env, ...secretValue }
  } catch (error) {
    logger.error(`Unable to get registerSecret: ${error}`, { exception: error })
  }
}
