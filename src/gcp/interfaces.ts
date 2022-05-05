import { Readable } from 'stream'

export interface RemoteStorage {
  upload(name: string, stream: Readable): Promise<string>
  download(fileName: string): Readable
}

export interface GoogleStorageConfig {
  bucketName: string,
  storageOptions?: {
    apiEndpoint?: string
  }
}

export const cloudStorageDictionary = {
  bucketName: {
    env: 'MEDIA_STORAGE_BUCKET_NAME',
  },
}
