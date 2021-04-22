import { createServer, RequestListener, Server } from 'http'
import { Logger } from 'winston'

export class HttpServer {
  private static httpServer: HttpServer

  private server: Server

  private constructor(private logger: Logger, application: RequestListener) {
    this.server = createServer(application)
  }

  static create(application: RequestListener, logger: Logger): HttpServer {
    if (this.httpServer) {
      return this.httpServer
    }
    this.httpServer = new HttpServer(logger, application)

    return this.httpServer
  }

  start(port: number): void {
    this.server.listen(port)
    this.server.on('listening', () => {
      this.logger.info(`Listening via ${port}: ${process.cwd()}`, { a: 1 })
    })
    this.server.on('error', (exception) => {
      this.logger.error('Server exception: ', { exception })
    })
  }
}
