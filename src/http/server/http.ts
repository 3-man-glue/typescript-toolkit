import { createServer, RequestListener, Server } from 'http'
import { HttpServerConfig, LoaderFunction } from './interfaces'
import { Logger } from '@utils/logger'

export class HttpServer {
  private static httpServer: HttpServer

  private server: Server

  private port = 8080

  private logger: Logger

  private loader: LoaderFunction = () => Promise.resolve()

  private constructor(application: RequestListener, logger: Logger) {
    this.server = createServer(application)
    this.logger = logger
  }

  static create(application: RequestListener, logger: Logger): HttpServer {
    if (this.httpServer) {
      return this.httpServer
    }
    this.httpServer = new HttpServer(application, logger)

    return this.httpServer
  }

  public setup(config: Partial<HttpServerConfig>): HttpServer {
    this.port = config.port ? config.port:this.port

    return this
  }

  public setLoaderFunction(loader: LoaderFunction): HttpServer {
    this.loader = loader

    return this
  }

  public start(): Promise<void> {
    return this.loader()
      .then(() => this.bootstrap())
      .catch((e) => this.raiseException(e))
  }

  private bootstrap(): void {
    this.server.listen(this.port)
    this.server.on('listening', () => this.logger.info(`Listening via ${this.port}: ${process.cwd()}`))
    this.server.on('error', (e) => this.raiseException(e))
  }

  private raiseException(e: Error): void {
    this.logger.error(`Unable to bootstrap HTTP server: ${e}`, { exception: e })

    process.exit(1)
  }
}
