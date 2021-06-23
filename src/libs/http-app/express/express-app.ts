import express, { Express, Request, Response } from 'express'
import { Container } from 'typedi'
import { HttpApp } from './interfaces'
import { getEmptyContext } from '../context/context'
import { ContextDto } from '../context/interfaces'
import { ControllerConstructor } from '../handler/interfaces'

export class ExpressApp implements HttpApp {
  private static appInstance: ExpressApp
  public engine: Readonly<Express>

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

  public attachController<P extends ControllerConstructor<Q, R>, Q extends ContextDto, R extends ContextDto>
  (Controller: P): ExpressApp {
    this.engine[ Controller.method ](Controller.path, async (req: Request, res: Response) => {
      const controller = Container.has(Controller) ? Container.get(Controller) : new Controller()
      const context = { ...getEmptyContext(), request: req as ContextDto as Q }
      controller.setContext(context)
      await controller.invoke()
      res.status(controller.context.status).json(controller.context.response)
    })

    return this
  }
}
