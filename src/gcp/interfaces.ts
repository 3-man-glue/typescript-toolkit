import { Readable } from 'stream'

export interface RemoteStorage {
  upload(name: string, stream: Readable): Promise<string>
  download(fileName: string): Readable
}

export type GoogleCloudConfig = {
  projectId: string,
  storage: {
    media: GoogleStorageConfig
  }
}

export type GoogleStorageConfig = {
  bucketName: string,
}
