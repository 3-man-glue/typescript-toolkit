import 'reflect-metadata'
import express, { NextFunction, Request, Response } from 'express'
import logger from '@utils/logger'
import { Controller } from '@http-kit/app/handler/controller'
import { Get } from '@http-kit/app/handler/route-builder'
import { ContextDto } from '@http-kit/context/interfaces'
import { ExpressApp } from '@http-kit/app/express'
import { Middleware } from '@http-kit/app/handler/interfaces'

jest.mock('express', () => {
  const express = jest.fn().mockReturnValue({ get: jest.fn(), post: jest.fn(), use: jest.fn() })
  // eslint-disable-next-line
  // @ts-ignore
  express.json = jest.fn()

  return express
})

class MockController extends Controller<Record<string, never>, ContextDto> {
  protected handle(): void {
    this.status = 200
    this.response = { mock: 'response' }
  }
}

describe('ExpressApp', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe('get instance', () => {
    it('should get same instance given call 2 times', () => {
      const app1 = ExpressApp.instance
      const app2 = ExpressApp.instance
      expect(app1).toStrictEqual(app2)
      expect(express).toHaveBeenCalledTimes(1)
    })
  })

  describe('registerRoute', () => {
    it('should setup route properly', () => {
      const app = ExpressApp.instance
      const spyHandler = jest.fn()
      const routeBuilder = Get({ path: '/path' }).setChain(spyHandler)

      app.registerRoute(routeBuilder)

      expect(app.engine.get).toHaveBeenCalledTimes(1)
      expect(app.engine.get).toHaveBeenCalledWith('/path', expect.any(Function))
    })
  })

  describe('Express Route middleware', () => {
    const mockNextFn = jest.fn() as unknown as NextFunction

    it('should call next properly', async () => {
      const mockMiddleware = jest.fn((_req: Request, _res: Response, next: NextFunction) => {
        next()
      })
      const app = ExpressApp.instance.registerRoute(
        Get({ path: '/path' }).setMiddlewares(mockMiddleware as unknown as Middleware).setChain(MockController),
      )
      const expressRouteHandlerArgs = jest.spyOn(app.engine, 'get').mock.calls[ 0 ]
      const middlewareHandler = expressRouteHandlerArgs ? expressRouteHandlerArgs[ 1 ] : undefined

      if (middlewareHandler) {
        await middlewareHandler(jest.fn() as unknown as Request, jest.fn() as unknown as Response, mockNextFn)
      }

      expect(mockNextFn).toHaveBeenCalledTimes(1)
      expect(mockNextFn).toHaveBeenCalledWith()
    })
  })

  describe('Express Route handler', () => {
    const mockResFn = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response

    beforeEach(() => {
      jest.spyOn(logger, 'error').mockImplementation()
    })

    it('should respond to client properly', async () => {
      const app = ExpressApp.instance.registerRoute(Get({ path: '/path' }).setChain(MockController))
      const expressRouteHandlerArgs = jest.spyOn(app.engine, 'get').mock.calls[ 0 ]
      const routeHandler = expressRouteHandlerArgs ? expressRouteHandlerArgs[ 1 ] : undefined
      const expectedJson = { mock: 'response' }

      if (routeHandler) {
        await routeHandler(jest.fn() as unknown as Request, mockResFn)
      }

      expect(mockResFn.status).toHaveBeenCalledTimes(1)
      expect(mockResFn.status).toHaveBeenCalledWith(200)
      expect(mockResFn.json).toHaveBeenCalledTimes(1)
      expect(mockResFn.json).toHaveBeenCalledWith(expectedJson)
    })
  })
})
