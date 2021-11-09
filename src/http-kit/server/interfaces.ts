export interface HttpServerConfig {
  port: number
}

export type LoaderFunction = () => Promise<void> | void
