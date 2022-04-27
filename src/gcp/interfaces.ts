import { Readable } from 'stream'

export interface RemoteStorage {
  upload(name: string, stream: Readable): Promise<string>
  download(fileName: string): Readable
}

export type GoogleStorageConfig = {
  bucketName: string,
}

export const cloudStorageDictionary = {
  bucketName: {
    env: 'MEDIA_STORAGE_BUCKET_NAME',
  },
}
