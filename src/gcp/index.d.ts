/// <reference types="node" />
import { Readable } from 'stream'
import { app } from 'firebase-admin'
import { PlainObject } from '@utils/common-types'
import { MessageDto, MessageQueueAdapter, MessageHandler } from '@mq/interfaces'
export declare class PubSubAdapter implements MessageQueueAdapter {
  private readonly pubsub

  constructor(config: GoogleCloudConfig)

  createTopic(topicName: string): Promise<void>

  subscribe<T extends MessageDto>(subject: string, handler: MessageHandler<T>): void

  publish(topic: string, data: PlainObject): Promise<void>

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

  constructor()
}

export declare class CloudStorage implements RemoteStorage {
  #private

  constructor(config: GoogleCloudConfig)

  upload(name: string, stream: Readable): Promise<string>

  download(fileName: string): Readable
}

export type PubSubConfig = {
  projectId: string
}
