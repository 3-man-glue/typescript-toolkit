import 'reflect-metadata'
import express, { Request, Response } from 'express'
import { Service } from 'typedi'
import { ApiMethod } from 'libs/http-app/handler/interfaces'
import { Controller } from 'libs/http-app/handler/controller'
import { ExpressApp } from 'libs/http-app/express/express-app'
import { ContextDto } from 'libs/http-app/context/interfaces'

jest.mock('express', () => {
  return jest.fn().mockReturnValue({
    get: jest.fn(),
    post: jest.fn(),
  })
})

afterEach(() => {
  jest.clearAllMocks()
  jest.resetModules()
})

class IndependentController extends Controller<ContextDto, ContextDto> {
  static method: ApiMethod = 'get'
  static api = { path: 'test' }

  protected handle(): void {
    this.status = 200
    this.response = { mock: 'response' }
  }
}

@Service()
class DependentController extends Controller<ContextDto, ContextDto> {
  static method: ApiMethod = 'post'
  static api = { path: 'test' }

  protected handle(): void {
    this.status = 999
    this.response = { mock: 'response from register controller' }
  }
}

describe('ExpressApp', () => {
  describe('get instance', () => {
    it('Should get same instance given call 2 times', () => {
      const app1 = ExpressApp.instance
      const app2 = ExpressApp.instance
      expect(app1).toStrictEqual(app2)
      expect(express).toHaveBeenCalledTimes(1)
    })
  })

  describe('attachController', () => {
    it('Should call method given valid controller', () => {
      const app = ExpressApp.instance

      app.attachController(IndependentController)

      expect(app.engine.get).toHaveBeenCalledTimes(1)
      expect(app.engine.get).toHaveBeenCalledWith(IndependentController.path, expect.any(Function))
    })
  })
  describe('Express Route handler', () => {
    const mockResFn = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response

    it('Should have been setup properly when attach with independent controller', async () => {
      const app = ExpressApp.instance.attachController(IndependentController)
      const expressRouteHandlerArgs = jest.spyOn(app.engine, 'get').mock.calls[ 0 ]
      const routeHandler = expressRouteHandlerArgs ? expressRouteHandlerArgs[ 1 ] : undefined
      const expectedJson = { mock: 'response' }

      if (routeHandler) {
        await routeHandler({} as Request, mockResFn)
      }

      expect(mockResFn.status).toHaveBeenCalledTimes(1)
      expect(mockResFn.status).toHaveBeenCalledWith(200)
      expect(mockResFn.json).toHaveBeenCalledTimes(1)
      expect(mockResFn.json).toHaveBeenCalledWith(expectedJson)
    })

    it('Should have been setup properly when attach with dependent controller', async () => {
      const app = ExpressApp.instance.attachController(DependentController)
      const expressRouteHandlerArgs = jest.spyOn(app.engine, 'post').mock.calls[ 0 ]
      const routeHandler = expressRouteHandlerArgs ? expressRouteHandlerArgs[ 1 ] : undefined
      const expectedJson = { mock: 'response from register controller' }

      if (routeHandler) {
        await routeHandler({} as Request, mockResFn)
      }

      expect(mockResFn.status).toHaveBeenCalledTimes(1)
      expect(mockResFn.status).toHaveBeenCalledWith(999)
      expect(mockResFn.json).toHaveBeenCalledTimes(1)
      expect(mockResFn.json).toHaveBeenCalledWith(expectedJson)
    })
  })
})
