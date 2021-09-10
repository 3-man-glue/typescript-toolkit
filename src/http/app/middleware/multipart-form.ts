import { BadRequestException } from '@http/exception/bad-request'
import { Middleware } from '@http/app/handler/interfaces'
import multer from 'multer'

interface MultipartFormOptions {
  limitSize?: number
  acceptedExts?: string[]
}
export const multipartFormInterceptor = (options: MultipartFormOptions = {}): Middleware => {
  const {
    limitSize = 5 * 1000 * 1000,
    acceptedExts = [],
  } = options

  return multer({
    dest: 'data/multipart',
    limits: { fileSize: limitSize },
    fileFilter: filterFileByExt(acceptedExts),
  }).any() as Middleware
}

const filterFileByExt = (acceptedExts: string[]) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return function (request: Express.Request, file: Express.Multer.File, cb: CallableFunction) {
    if (!acceptedExts.length) {
      return cb(null, true)
    }

    if (!acceptedExts.includes(file.mimetype)) {
      return cb(new BadRequestException().withInput({ file }))
    }

    cb(null, true)
  }
}
