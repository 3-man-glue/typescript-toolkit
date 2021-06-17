import { ApiMethod } from 'libs/http-app/handler/interfaces'
import { Controller } from 'libs/http-app/handler/controller'
import { ExpressApp } from 'libs/http-app/express/express-app'
import express from 'express'
jest.mock('express', () => {
  return jest.fn().mockReturnValue({
    get: jest.fn(),
  })
})

afterEach(() => {
  jest.clearAllMocks()
  jest.resetModules()
})

describe('ExpressApp', () => {
  describe('get instance', () => {
    test('Should get same instance given call 2 times', () => {
      const app1 = ExpressApp.instance
      const app2 = ExpressApp.instance
      expect(app1).toStrictEqual(app2)
      expect(express).toHaveBeenCalledTimes(1)
    })
  })

  describe('attachController', () => {
    test('Should call method given valid controller', () => {
      const expectedMethod = 'get'
      const app = ExpressApp.instance
      class mockController implements Controller<any, any> {
        static method = expectedMethod as ApiMethod
        static path = '/test'
        static api = { path: 'test' }
        readonly context: any
        readonly status: any
        readonly request: any
        readonly response: any
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        invoke() {}
      }
      app.attachController(mockController)
      expect(app.engine[expectedMethod]).toHaveBeenCalledTimes(1)
      expect(app.engine[expectedMethod]).toHaveBeenCalledWith(mockController.path, expect.any(Function))
    })
  })
})
