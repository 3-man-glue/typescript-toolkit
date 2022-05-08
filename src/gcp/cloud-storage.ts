import { Readable } from 'stream'
import { Bucket, Storage } from '@google-cloud/storage'
import { GoogleStorageConfig, RemoteStorage } from '@gcp/interfaces'
import IdGen from '@utils/id-generator'
import { RemoteStorageException } from '@http-kit/exception/remote-storage'

export class CloudStorage implements RemoteStorage {
  #storage: Storage

  #bucket: Bucket

  readonly #delimiter: string

  constructor(config: GoogleStorageConfig) {
    this.#storage = new Storage(config.storageOptions)
    this.#bucket = this.#storage.bucket(config.bucketName)
    this.#delimiter = '/'
  }

  public upload(name: string, stream: Readable): Promise<string> {
    const uniqueId = IdGen.cuid({ value: 'CS' })
    const fileName = `${name}${this.#delimiter}${uniqueId}`

    const googleStream = this.#bucket.file(fileName).createWriteStream({
      resumable: false,
    })

    return new Promise((resolve, reject) => {
      stream.pipe(googleStream)

      stream.on('end', () => {
        resolve(fileName)
      })

      stream.on('error', (err: Error) => {
        reject(err)
      })
    })
  }

  public download(fileName: string): Readable {
    const stream = this.#bucket.file(fileName).createReadStream()

    if(!stream) {
      throw new RemoteStorageException('File not found')
        .withInput({ fileName })
    }

    return stream
  }
}
