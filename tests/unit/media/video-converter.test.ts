import 'reflect-metadata'
import EventEmitter from 'events'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { Readable } from 'stream'
import { VideoConverter } from '@media/video-converter'

const mockFFMPeg = {
  screenshot: jest.fn(),
}

jest.mock('@utils/id-generator', () => ({ cuid: jest.fn().mockReturnValue('random-cuid') }))
jest.mock('fluent-ffmpeg', () => {
  const ffmpeg = jest.fn(() => mockFFMPeg)
  // eslint-disable-next-line
  // @ts-ignore
  ffmpeg.setFfmpegPath = jest.fn()

  return ffmpeg
})

describe('Video Converter', () => {
  let videoConverter: VideoConverter
  let mockScreenshot: EventEmitter

  beforeEach(() => {
    videoConverter = new VideoConverter({ width: 200 })
    mockScreenshot = new EventEmitter()
    mockFFMPeg.screenshot.mockReturnValue(mockScreenshot)
  })

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('generateThubnail', () => {
    it('should generate thumbnail properly', () => {
      jest.spyOn(os, 'tmpdir').mockReturnValue('fake-dir')
      jest.spyOn(path, 'format').mockReturnValue('fake-path')
      const mockReadFileSync = jest.spyOn(fs, 'readFileSync').mockReturnValue('fake-buffer')
      const videoPath = '/path'
      let thumbnail: Readable

      videoConverter.generateThumbnail(videoPath)
        .then(result => {
          thumbnail = result
        })
      mockScreenshot.emit('end')

      setTimeout(() => {
        expect(thumbnail).toBeInstanceOf(Readable)
        expect(mockReadFileSync).toBeCalledWith('fake-path')
        expect(mockFFMPeg.screenshot).toBeCalledWith({
          folder: 'fake-dir/thumbnail',
          filename: 'random-cuid',
          count: 1,
          timemarks: [ '00:00:00.001' ],
          size: '200x',
        })
      }, 10)
    })

    it('should throw an error when it cannot read generated thumbnail file', () => {
      const expectedError = new Error('Cannot read file')
      const videoPath = '/path'
      let error: Error
      jest.spyOn(os, 'tmpdir').mockReturnValue('fake-dir')
      jest.spyOn(path, 'format').mockReturnValue('fake-path')
      jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
        throw expectedError
      })

      videoConverter.generateThumbnail(videoPath)
        .catch(e => {
          error = e
        })
      mockScreenshot.emit('end')

      setTimeout(() => {
        expect(error).toStrictEqual(expectedError)
      }, 10)
    })

    it('should throw an error when snapshot throws an error', () => {
      const mockReadFileSync = jest.spyOn(fs, 'readFileSync')
      const expectedError = new Error('Cannot read file')
      const videoPath = '/path'
      let error: Error

      videoConverter.generateThumbnail(videoPath)
        .catch(e => {
          error = e
        })
      mockScreenshot.emit('error', expectedError)

      setTimeout(() => {
        expect(error).toStrictEqual(expectedError)
        expect(mockReadFileSync).not.toBeCalled()
      }, 10)
    })
  })
})
