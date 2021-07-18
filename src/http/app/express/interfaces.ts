import { RequestListener } from 'http'

export interface HttpApp {
  engine: Readonly<RequestListener>
}
