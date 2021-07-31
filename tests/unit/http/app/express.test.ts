import 'reflect-metadata'
import express, { Request, Response } from 'express'
import logger from '@utils/logger'
import { Controller } from '@http/app/handler/controller'
import { Get } from '@http/app/handler/route-builder'
import { ContextDto } from '@http/context/interfaces'
import { InternalServerException } from '@http/exception/internal-server'
import { HttpException } from '@http/exception/http-exception'
import { ExpressApp } from '@http/app/express'

jest.mock('express', () => {
  return jest.fn().mockReturnValue({ get: jest.fn(), post: jest.fn() })
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
      expect(app.engine.get).toHaveBeenCalledWith('/platform/path', expect.any(Function))
    })
  })

  describe('Express Route handler', () => {
    const mockResFn = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response

    class ExceptionWithoutCode extends HttpException {
    }

    beforeEach(() => {
      jest.spyOn(logger, 'error').mockImplementation()
    })

    it('should respond to client properly', async () => {
      const app = ExpressApp.instance.registerRoute(Get({ path: '/path' }).setChain(MockController))
      const expressRouteHandlerArgs = jest.spyOn(app.engine, 'get').mock.calls[ 0 ]
      const routeHandler = expressRouteHandlerArgs ? expressRouteHandlerArgs[ 1 ]: undefined
      const expectedJson = { mock: 'response' }

      if (routeHandler) {
        await routeHandler(jest.fn() as unknown as Request, mockResFn)
      }

      expect(mockResFn.status).toHaveBeenCalledTimes(1)
      expect(mockResFn.status).toHaveBeenCalledWith(200)
      expect(mockResFn.json).toHaveBeenCalledTimes(1)
      expect(mockResFn.json).toHaveBeenCalledWith(expectedJson)
    })

    it('should intercept with error response when response object failed with standard error', async () => {
      const app = ExpressApp.instance.registerRoute(Get({ path: '/path' }).setChain(MockController))
      const expressRouteHandlerArgs = jest.spyOn(app.engine, 'get').mock.calls[ 0 ]
      const routeHandler = expressRouteHandlerArgs ? expressRouteHandlerArgs[ 1 ]: undefined
      const expectedJson = { mock: 'response' }
      const expectedErrorJson = { code: 'InternalServerException', message: new InternalServerException().message }
      mockResFn.json = jest.fn().mockImplementationOnce(() => {
        throw new Error()
      })

      if (routeHandler) {
        await routeHandler(jest.fn() as unknown as Request, mockResFn)
      }

      expect(mockResFn.status).toHaveBeenCalledTimes(2)
      expect(mockResFn.status).toHaveBeenNthCalledWith(1, 200)
      expect(mockResFn.status).toHaveBeenNthCalledWith(2, 500)
      expect(mockResFn.json).toHaveBeenCalledTimes(2)
      expect(mockResFn.json).toHaveBeenNthCalledWith(1, expectedJson)
      expect(mockResFn.json).toHaveBeenNthCalledWith(2, expectedErrorJson)
      expect(logger.error).toHaveBeenCalled()
    })

    it('should intercept with error response when response object failed with http exception', async () => {
      const app = ExpressApp.instance.registerRoute(Get({ path: '/path' }).setChain(MockController))
      const expressRouteHandlerArgs = jest.spyOn(app.engine, 'get').mock.calls[ 0 ]
      const routeHandler = expressRouteHandlerArgs ? expressRouteHandlerArgs[ 1 ]: undefined
      const expectedJson = { mock: 'response' }
      const expectedErrorJson = { message: 'exception without code' }
      mockResFn.json = jest.fn().mockImplementationOnce(() => {
        throw new ExceptionWithoutCode(400, 'exception without code')
      })

      if (routeHandler) {
        await routeHandler(jest.fn() as unknown as Request, mockResFn)
      }

      expect(mockResFn.status).toHaveBeenCalledTimes(2)
      expect(mockResFn.status).toHaveBeenNthCalledWith(1, 200)
      expect(mockResFn.status).toHaveBeenNthCalledWith(2, 400)
      expect(mockResFn.json).toHaveBeenCalledTimes(2)
      expect(mockResFn.json).toHaveBeenNthCalledWith(1, expectedJson)
      expect(mockResFn.json).toHaveBeenNthCalledWith(2, expectedErrorJson)
      expect(logger.error).toHaveBeenCalled()
    })
  })
})
