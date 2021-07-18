import express from 'express'
import logger from './logger/logger'
import { HttpServer } from '@http/server/http'

const app = express()

HttpServer.create(app, logger)
  .setup({
    port: parseInt(process.env[ 'HTTP_PORT' ] || '', 10),
  })
  .start()
