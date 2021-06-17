import { ApiMethod } from 'libs/http-app/handler/interfaces'
import { Controller } from 'libs/http-app/handler/controller'
import { ExpressApp } from 'libs/http-app/express/express-app'
import request from 'supertest'

describe('Integration ExpressApp', () => {
  describe('attachController', () => {
    test('Should controller call invoke given valid controller', async () => {
      const expectedMethod = 'get'
      const expectedPath = '/test'
      const expectedStatus = 200
      const app = ExpressApp.instance
      class mockController implements Controller<any, any> {
        static method = expectedMethod as ApiMethod
        static path = expectedPath
        static api = { path: 'test' }
        readonly context: any = { status: expectedStatus }
        readonly status: any
        readonly request: any
        readonly response: any
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        invoke() {}
      }
      const spyInvoke = jest.spyOn(mockController.prototype, 'invoke')
      app.attachController(mockController)

      const result = await request(app.engine).get(expectedPath)

      expect(result.statusCode).toBe(expectedStatus)
      expect(spyInvoke).toHaveBeenCalledTimes(1)
    })
  })
})
