import { createServer, Server } from 'http'
import { HttpServer } from 'libs/server/http'
import logger from 'libs/logger'

jest.mock('libs/logger')
jest.mock('http')

const mockedServer = {
  listen: jest.fn(),
  on: jest.fn(),
  emit: jest.fn(),
} as unknown as Server

beforeEach(() => {
  const mockedCreateServer = createServer as jest.MockedFunction<typeof createServer>
  mockedCreateServer.mockReturnValue(mockedServer)
})

afterEach(() => {
  jest.clearAllMocks()
  jest.resetModules()
})

describe('HttpServer', () => {
  describe('create()', () => {
    it('Should create single instance of HttpServer', () => {
      const fakeApp = jest.fn()
      const anotherApp = jest.fn()
      const firstCall = HttpServer.create(fakeApp, logger)
      const secondCall = HttpServer.create(anotherApp, logger)

      expect(firstCall).toBeInstanceOf(HttpServer)
      expect(secondCall).toStrictEqual(firstCall)
      expect(createServer).toHaveBeenCalledTimes(1)
      expect(createServer).toHaveBeenNthCalledWith(1, fakeApp)
    })
  })

  describe('start()', () => {
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      jest.spyOn(process, 'exit').mockImplementation()
    })

    it('Should start properly with least setup', async () => {
      const fakeApp = jest.fn()

      await HttpServer.create(fakeApp, logger).start()

      expect(mockedServer.listen).toHaveBeenCalledTimes(1)
      expect(mockedServer.listen).toHaveBeenCalledWith(80)
      expect(process.exit).not.toHaveBeenCalled()
    })

    it('Should start the application properly with default port', async () => {
      const fakeApp = jest.fn()
      const fakeLoader = jest.fn().mockImplementation(() => Promise.resolve())

      await HttpServer.create(fakeApp, logger).setLoaderFunction(fakeLoader).start()

      expect(fakeLoader).toBeCalledTimes(1)
      expect(mockedServer.listen).toHaveBeenCalledTimes(1)
      expect(mockedServer.listen).toHaveBeenCalledWith(80)
      expect(process.exit).not.toHaveBeenCalled()
    })

    it('Should start the application properly with default port when setup without port config', async () => {
      const fakeApp = jest.fn()
      const fakeLoader = jest.fn().mockImplementation(() => Promise.resolve())

      await HttpServer.create(fakeApp, logger).setup({}).setLoaderFunction(fakeLoader).start()

      expect(fakeLoader).toBeCalledTimes(1)
      expect(mockedServer.listen).toHaveBeenCalledTimes(1)
      expect(mockedServer.listen).toHaveBeenCalledWith(80)
      expect(process.exit).not.toHaveBeenCalled()
    })

    it('Should start the application properly with specific port', async () => {
      const fakeApp = jest.fn()
      const fakeLoader = jest.fn().mockImplementation(() => Promise.resolve())

      await HttpServer.create(fakeApp, logger).setup({ port: 8080 }).setLoaderFunction(fakeLoader).start()

      expect(fakeLoader).toBeCalledTimes(1)
      expect(mockedServer.listen).toHaveBeenCalledTimes(1)
      expect(mockedServer.listen).toHaveBeenCalledWith(8080)
      expect(process.exit).not.toHaveBeenCalled()
    })

    it('Should log error and terminate when loader function failed', async () => {
      const fakeApp = jest.fn()
      const fakeLoader = jest.fn().mockRejectedValueOnce(new Error('Loader-error'))

      await HttpServer.create(fakeApp, logger).setup({ port: 8080 }).setLoaderFunction(fakeLoader).start()

      expect(logger.error).toBeCalledTimes(1)
      expect(process.exit).toBeCalledWith(1)
    })
  })
})
