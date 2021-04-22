import { HttpServer } from './libs/server/http'
import logger from './libs/logger'
import express from 'express'

const PORT = parseInt(process.env['HTTP_PORT'] || '', 10) || 80

const server = HttpServer.create(express(), logger)

server.start(PORT)
