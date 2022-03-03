/* eslint-disable @typescript-eslint/ban-ts-comment */
import { BadRequestException } from '@http-kit/exception/bad-request'
import { Middleware } from '@http-kit/app/handler/interfaces'
import { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import { HttpException } from '@http-kit/exception/http-exception'
import { formatErrorResponse } from '@http-kit/app/express'
import { InternalServerException } from '@http-kit/exception/internal-server'
import logger from '@utils/logger'

export type FilterFileFunc = (req: Request, file: Express.Multer.File, cb: CallableFunction) => void
interface MultipartFormOptions {
  limitSize?: number
  acceptedExts?: string[]
  overwriteFilterFunc?: FilterFileFunc
}

const storage = multer.diskStorage({
  // @ts-ignore
  destination: function (req: Express.Request, file: Express.Multer.File, cb: CallableFunction) {
    cb(null, 'data/multipart')
  },
  // @ts-ignore
  filename: function (req: Express.Request, file: Express.Multer.File, cb: CallableFunction) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  },
})
export const multipartFormInterceptor = (options: MultipartFormOptions = {}): Middleware => {
  const {
    limitSize = 5 * 1024 ** 2,
    acceptedExts = [],
    overwriteFilterFunc,
  } = options

  const upload = multer({
    storage,
    limits: { fileSize: limitSize },
    fileFilter: overwriteFilterFunc ? overwriteFilterFunc : filterFileByExt(acceptedExts),
  }).any()

  return function (req: Request, res: Response, next: NextFunction) {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upload(req, res, function(error: any) {
      if (error) {
        const exception = error instanceof HttpException ? error : new InternalServerException().withCause(error)

        logger.error(exception)

        return res.status(exception.status).json(formatErrorResponse(exception))
      }

      return next()
    })
  }
}

const filterFileByExt = (acceptedExts: string[]) => {
  // eslint-disable-next-line
  //@ts-ignore
  return function (req: Express.Request, file: Express.Multer.File, cb: CallableFunction) {
    if (!acceptedExts.length) {
      return cb(null, true)
    }

    if (!acceptedExts.includes(file.mimetype)) {
      return cb(new BadRequestException().withInput({ file }))
    }

    cb(null, true)
  }
}
