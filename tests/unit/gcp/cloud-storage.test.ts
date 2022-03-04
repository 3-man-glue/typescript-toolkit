import 'reflect-metadata'
import { Readable } from 'stream'
import Container from 'typedi'
import { Bucket, Storage } from '@google-cloud/storage'
import { CloudStorage } from '@gcp/cloud-storage'
import { GoogleCloudConfig } from '@gcp/interfaces'
import { RemoteStorageException } from '@http-kit/exception/remote-storage'

jest.mock('stream')
jest.mock('@utils/id-generator', () => ({ cuid: jest.fn().mockReturnValue('random-cuid') }))

const mockGoogleStream = jest.fn()

const mockFileFunctions = {
  createWriteStream: jest.fn().mockReturnValue(mockGoogleStream),
  createReadStream: jest.fn(),
}

jest.mock('@google-cloud/storage', () => {
  return {
    Storage: jest.fn().mockReturnValue({
      bucket: jest.fn().mockReturnValue({
        file: jest.fn(() => mockFileFunctions),
      }),
    }),
  }
})

describe('Cloud Storage', () => {
  let cloudStorage: CloudStorage
  let mockStorageInstance: Storage
  let fakeBucket: Bucket

  beforeEach(() => {
    const config = {
      storage: {
        media: { bucketName: 'fake-bucket' },
      },
    } as unknown as GoogleCloudConfig
    cloudStorage = new CloudStorage(config)

    fakeBucket = jest.fn().mockReturnValue({ file: jest.fn() }) as unknown as Bucket
    mockStorageInstance = (Storage as unknown as jest.Mock).mock.instances[0]
    mockStorageInstance.bucket = jest.fn().mockReturnValue(fakeBucket)
  })

  afterEach(() => {
    Container.reset()
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('upload', () => {
    it('should upload the given stram properly', () => {
      const stream = new Readable()
      const pipeSpy = jest.spyOn(stream, 'pipe')
      const unpipeSpy = jest.spyOn(stream, 'unpipe')
      let fileName: string

      cloudStorage.upload('fake-file-name', stream)
        .then(name => {
          fileName = name
        })
      stream.emit('end')

      expect(pipeSpy).toBeCalledWith(mockGoogleStream)
      setTimeout(() => {
        expect(unpipeSpy).toBeCalled()
        expect(fileName).toBe('fake-file-name/random-cuid')
      }, 10)
    })

    it('should throw an error if the upload fails', () => {
      const expectedError = new Error('upload failed')
      const stream = new Readable()
      const pipeSpy = jest.spyOn(stream, 'pipe')
      let error: Error

      cloudStorage.upload('fake-file-name', stream)
        .catch(err => {
          error = err
        })
      stream.emit('error', expectedError)

      expect(pipeSpy).toBeCalledWith(mockGoogleStream)
      setTimeout(() => {
        expect(error).toStrictEqual(expectedError)
      }, 10)
    })
  })

  describe('download', () => {
    it('should return readable stream with the given file name', () => {
      const expectedStream = 'fake-stream'
      jest.spyOn(mockFileFunctions, 'createReadStream').mockReturnValue(expectedStream)

      const readableStream = cloudStorage.download('fake-file-name/some-random-id')

      expect(readableStream).toEqual(expectedStream)
    })

    it('should throw an error when file is not found', () => {
      let isThrown = false
      jest.spyOn(mockFileFunctions, 'createReadStream').mockReturnValue(undefined)

      try {
        cloudStorage.download('fake-file-name/some-random-id')
      } catch (error) {
        expect(error).toBeInstanceOf(RemoteStorageException)
        isThrown = true
      }

      expect(isThrown).toBeTruthy()
    })
  })
})
