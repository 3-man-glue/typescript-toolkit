import { InternalServerException } from '@http-kit/exception/internal-server'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'
import { PlainObject } from '@utils/common-types'
import logger from '@utils/logger'

type EnvParams = {
  gcpProjectId: string
  gcpSecretName: string
}

export async function setupSecretManager(env: EnvParams): Promise<PlainObject> {
  const client = new SecretManagerServiceClient()
  const gcpProjectId = env['gcpProjectId']
  const secretName = env['gcpSecretName']
  try {
    const [ secret ] = await client.accessSecretVersion({
      name: `projects/${gcpProjectId}/secrets/${secretName}/versions/latest`,
    })
    const secretValue: PlainObject = secret.payload?.data
      ? JSON.parse(secret.payload.data.toString())
      : {}

    return secretValue
  } catch (error) {
    logger.error(`Unable to get registerSecret: ${error}`, { exception: error })
    throw new InternalServerException(`Unable to get registerSecret: ${error}`)
  }
}
