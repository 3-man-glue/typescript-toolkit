import express from 'express'
import logger from './libs/logger'
import { HttpServer } from './libs/server/http'
import { viewSystemUsage } from './libs/system-usage'

const app = express()
app.get('/health', (req, res) => {
  req.body = {}

  res.status(200).send(viewSystemUsage())
})

HttpServer.create(app, logger)
  .setup({
    port: parseInt(process.env[ 'HTTP_PORT' ] || '', 10) || 80,
  })
  .start()
