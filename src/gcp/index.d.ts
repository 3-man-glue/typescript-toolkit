/// <reference types="node" />
import { Readable } from 'stream'
import { app } from 'firebase-admin'
import { GetTopicMetadataResponse, IamPermissionsMap } from '@google-cloud/pubsub'
import { MessageDto, MessageQueueAdapter, MessageHandler } from '@mq/interfaces'

export declare class PubSubAdapter implements MessageQueueAdapter {
  private readonly pubsub

  constructor()

  getTopicMetadata(topicName: string): Promise<GetTopicMetadataResponse>

  testPermissions(topicName: string, permissions: string[]): Promise<IamPermissionsMap>

  createTopic(topicName: string): Promise<void>

  subscribe<T extends MessageDto>(subject: string, handler: MessageHandler<T>): void

  publish<T>(topic: string, data: T): Promise<void>

  private formatMessage
}

export interface RemoteStorage {
  upload(name: string, stream: Readable): Promise<string>
  download(fileName: string): Readable
}
export declare type GoogleCloudConfig = {
  projectId: string
  storage: {
    media: GoogleStorageConfig
  }
}
export declare type GoogleStorageConfig = {
  bucketName: string
}

export declare class FirebaseApp {
  app: app.App

  private readonly FIREBASE_NAME

  constructor(firebaseName: string)
}

export declare class CloudStorage implements RemoteStorage {
  constructor(config: GoogleCloudConfig)

  upload(name: string, stream: Readable): Promise<string>

  download(fileName: string): Readable
}

import FirebaseAdmin = require('firebase-admin')
export { FirebaseAdmin }
