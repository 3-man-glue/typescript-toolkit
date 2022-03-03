import express, { Express, NextFunction, Request, Response } from 'express'
import { HttpApp } from './interfaces'
import { getEmptyContext } from '@http-kit/context/context'
import { ContextDto, HttpContext } from '@http-kit/context/interfaces'
import { RouteBuilder } from './handler/interfaces'
import { HttpException } from '@http-kit/exception/http-exception'
import { InternalServerException } from '@http-kit/exception/internal-server'
import logger from '@utils/logger'

export type ExpressHandler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void

export class ExpressApp implements HttpApp {
  private static appInstance: ExpressApp

  public engine: Express

  private constructor(expressInstance: Express) {
    this.engine = expressInstance
    this.engine.use(express.json())
  }

  static get instance(): ExpressApp {
    if (this.appInstance) {
      return this.appInstance
    }
    this.appInstance = new ExpressApp(express())

    return this.appInstance
  }

  public registerRoute(builder: RouteBuilder): ExpressApp {
    const route = builder.setContextMapper(mapper).build()
    this.engine[ route.method ](route.path, ...builder.middlewares, async (req: Request, res: Response) => {
      try {
        const { status, response } = await route.handle(req, res)
        res.status(status).json(response)
      } catch (e) {
        const exception = e instanceof HttpException ? e : new InternalServerException().withCause(e)

        res.status(exception.status).json(formatErrorResponse(exception))
        logger.error(exception)
      }
    })

    return this
  }
}

export function formatErrorResponse(e: HttpException): Record<string, string> {
  return Object.assign({}, e.code ? { code: e.code } : undefined, { message: e.message })
}

export function mapper(req: Request): HttpContext<ContextDto, ContextDto> {
  return {
    ...getEmptyContext(),
    request: req.body as ContextDto,
    metadata: {
      reqParams: Object.freeze(req.params),
      reqQuery: Object.freeze(req.query),
      reqHeaders: Object.freeze(req.headers),
      reqFiles: Object.freeze(req.files) ?? [ Object.freeze(req.file) ],
    },
  }
}
