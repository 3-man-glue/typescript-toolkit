import express from 'express'
import logger from '@utils/logger'
import { HttpServer } from '@http-kit/server/http'

const app = express()

HttpServer.create(app, logger)
  .setup({
    port: parseInt(process.env[ 'HTTP_PORT' ] || '', 10),
  })
  .start()
