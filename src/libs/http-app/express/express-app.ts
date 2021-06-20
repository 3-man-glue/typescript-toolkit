import express, { Express, Request, Response } from 'express'
import { Container } from 'typedi'
import { ControllerConstructor } from 'libs/http-app/handler/controller'
import { HttpApp } from './interfaces'

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

  public attachController(Controller: ControllerConstructor): ExpressApp {
    this.engine[ Controller.method ](Controller.path, async (req: Request, res: Response) => {
      const controller = Container.has(Controller) ? Container.get(Controller):new Controller()
      controller.context.request = req

      await controller.invoke()

      const { context } = controller
      res.status(context.status).json(context.response)
    })

    return this
  }
}
