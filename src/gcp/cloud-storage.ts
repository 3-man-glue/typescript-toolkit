import { Service } from 'typedi'
import { Readable } from 'stream'
import { Bucket, Storage } from '@google-cloud/storage'
import { GoogleCloudConfig, RemoteStorage } from '@gcp/interfaces'
import IdGen from '@utils/id-generator'
import { RemoteStorageException } from '@http-kit/exception/remote-storage'

@Service()
export class CloudStorage implements RemoteStorage {
  #storage: Storage

  #bucket: Bucket

  #delimiter: string

  constructor(config: GoogleCloudConfig) {
    this.#storage = new Storage()
    this.#bucket = this.#storage.bucket(config.storage.media.bucketName)
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
        stream.unpipe()
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
