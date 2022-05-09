import path from 'path'
import os from 'os'
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg'
import FFMPeg from 'fluent-ffmpeg'
import fs from 'fs'
import { Service } from 'typedi'
import { Readable } from 'stream'
import { MediaException } from '@http-kit/exception/media'
import IdGen from '@utils/id-generator'
import { VideoConfig } from '@media/interfaces'
FFMPeg.setFfmpegPath(ffmpegPath)

@Service()
export class VideoConverter {
  #config: Readonly<VideoConfig>

  constructor(videoConfig: VideoConfig) {
    this.#config = videoConfig
  }

  public generateThumbnail(videoPath: string): Promise<Readable> {
    const outputPath = {
      dir: path.join(os.tmpdir(), 'thumbnail'),
      name: IdGen.cuid(),
      ext: '.png',
    }

    const snapshot = FFMPeg(videoPath)
      .screenshot({
        folder: outputPath.dir,
        filename: outputPath.name,
        count: 1,
        timemarks: [ '00:00:00.001' ],
        size: `${this.#config.width}x?`,
      })

    return new Promise((resolve, reject) => {
      snapshot.on('end', () => {
        try {
          const thumbnailPath = path.format(outputPath)
          const buffer = fs.readFileSync(thumbnailPath)
          const readable = new Readable()

          readable.push(buffer)
          readable.push(null)

          resolve(readable)
        } catch (error) {
          const exception = new MediaException('Unable to create readable stream').withCause(error)
          reject(exception)
        }
      })

      snapshot.on('error', error => {
        const exception = new MediaException().withCause(error)
        reject(exception)
      })
    })
  }
}
