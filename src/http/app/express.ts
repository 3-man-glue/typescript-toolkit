import express, { Express, Request, Response } from 'express'
import { HttpApp } from './interfaces'
import { getEmptyContext } from '@http/context/context'
import { ContextDto, HttpContext } from '@http/context/interfaces'
import { RouteBuilder } from './handler/interfaces'
import { HttpException } from '@http/exception/http-exception'
import { InternalServerException } from '@http/exception/internal-server'
import logger from '@logger/logger'

export class ExpressApp implements HttpApp {
  private static appInstance: ExpressApp

  public engine: Express

  private constructor(express: Express) {
    this.engine = express
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
    this.engine[ route.method ](route.path, async (req: Request, res: Response) => {
      try {
        const { status, response } = await route.handle(req, res)
        res.status(status).json(response)
      } catch (e) {
        const exception = e instanceof HttpException ? e : new InternalServerException().withCause(e)

        res.status(exception.status).json(formatErrorResponse(exception))
        logger.error(exception.toString())
      }
    })

    return this
  }
}

function formatErrorResponse(e: HttpException): Record<string, string> {
  return Object.assign(
    {},
    e.code ? { code: e.code }: undefined,
    { message: e.message },
  )
}

function mapper(req: Request): HttpContext<ContextDto, ContextDto> {
  return {
    ...getEmptyContext(),
    request: req.body as ContextDto,
    metadata: {
      reqParams: Object.freeze(req.params),
      reqQuery: Object.freeze(req.query),
      reqHeaders: Object.freeze(req.headers),
    },
  }
}
