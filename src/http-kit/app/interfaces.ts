import { RequestListener } from 'http'
import { RouteBuilder } from '@http-kit/app/handler/interfaces'

export interface HttpApp {
  engine: Readonly<RequestListener>

  registerRoute(builder: RouteBuilder): HttpApp
}
