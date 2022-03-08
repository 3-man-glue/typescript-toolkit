/* eslint-disable no-underscore-dangle */
import { Readable, Writable } from 'stream'
import { Bucket, Storage } from '@google-cloud/storage'
import { CloudStorage } from '@gcp/cloud-storage'
import { GoogleCloudConfig } from '@gcp/interfaces'
import { RemoteStorageException } from '@http-kit/exception/remote-storage'

jest.mock('@utils/id-generator', () => ({ cuid: jest.fn().mockReturnValue('random-cuid') }))

const mockGoogleStream = new Writable()

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
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('upload', () => {
    it('should upload the given stram properly', (done) => {
      const stream = new Readable()
      stream._read = jest.fn()
      const pipeSpy = jest.spyOn(stream, 'pipe')
      const unpipeSpy = jest.spyOn(stream, 'unpipe')

      cloudStorage.upload('fake-file-name', stream)
        .then(fileName => {
          expect(pipeSpy).toBeCalledWith(mockGoogleStream)
          expect(unpipeSpy).toBeCalled()
          expect(fileName).toBe('fake-file-name/random-cuid')
          done()
        })
        .catch(e => done(e))

      stream.emit('end')
    })

    it('should throw an error if the upload fails', (done) => {
      const expectedError = new Error('upload failed')
      const stream = new Readable()
      stream._read = jest.fn()
      const pipeSpy = jest.spyOn(stream, 'pipe')

      cloudStorage.upload('fake-file-name', stream)
        .catch(error => {
          expect(error).toStrictEqual(expectedError)
          expect(pipeSpy).toBeCalledWith(mockGoogleStream)
          done()
        })
      stream.emit('error', expectedError)

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
