import express, { Express, NextFunction, Request, Response } from 'express'
import { HttpApp } from './interfaces'
import { getEmptyContext } from '@http-kit/context/context'
import { ContextDto, HttpContext } from '@http-kit/context/interfaces'
import { RouteBuilder } from './handler/interfaces'

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
    this.engine[route.method](route.path, ...builder.middlewares, async (req: Request, res: Response) => {
      const { status, response } = await route.handle(req, res)
      res.status(status).json(response)
    })

    return this
  }
}

export function mapper(req: Request): HttpContext<ContextDto, ContextDto> {
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