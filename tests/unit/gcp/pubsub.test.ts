import EventEmitter from 'events'
import { PubSub, Message as PubSubMessage } from '@google-cloud/pubsub'
import { PubSubAdapter } from '@gcp/pubsub'
import { PubSubConfig } from '@gcp/interfaces'
import { MessageDto, MessageQueueAdapter } from '@mq/interfaces'
import logger from '@utils/logger'

jest.mock('@google-cloud/pubsub')
jest.mock('@utils/logger')

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface MockMessageDto extends MessageDto {
}

describe('PubSub', () => {
  let clientPubSub: MessageQueueAdapter
  let fakeSubscription: EventEmitter
  let mockPubSubInstance: PubSub

  beforeEach(() => {
    clientPubSub = new PubSubAdapter({ projectId: 'project-id' } as unknown as PubSubConfig)

    fakeSubscription = new EventEmitter()
    mockPubSubInstance = (PubSub as unknown as jest.Mock).mock.instances[0]
    mockPubSubInstance.subscription = jest.fn().mockReturnValue(fakeSubscription)
  })

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('createTopic', () => {
    it('should create a topic', async () => {
      mockPubSubInstance.getTopics = jest.fn().mockReturnValueOnce([ [] ])
      mockPubSubInstance.createTopic = jest.fn()

      await clientPubSub.createTopic('new-topic')

      expect(mockPubSubInstance.createTopic).toHaveBeenCalledTimes(1)
      expect(mockPubSubInstance.createTopic).toHaveBeenCalledWith('new-topic')
    })

    it('should not create a topic when the topic is already created', async () => {
      mockPubSubInstance.getTopics = jest.fn().mockReturnValueOnce([ [
        { name: 'projects/testing-pubsub/topics/existed-topic' }
      ] ])
      mockPubSubInstance.createTopic = jest.fn()

      await clientPubSub.createTopic('existed-topic')

      expect(mockPubSubInstance.createTopic).not.toHaveBeenCalled()
    })
  })

  describe('subscribe', () => {
    const expectedData = { key: 'data-value' }
    let fakeMessage: PubSubMessage

    beforeEach(() => {
      const messageString = JSON.stringify({ key: 'data-value' })
      const dataBuffer = Buffer.from(messageString)

      fakeMessage = {
        data: dataBuffer,
        ack: jest.fn(),
        nack: jest.fn(),
      } as unknown as PubSubMessage
    })

    it('should subscribe given subscriptionName and messageHandler', () => {
      const fakeHandler = { handle: jest.fn() }

      clientPubSub.subscribe<MockMessageDto>('subscription-name', fakeHandler)
      fakeSubscription.emit('message', fakeMessage)

      expect(mockPubSubInstance.subscription).toHaveBeenCalledTimes(1)
      expect(mockPubSubInstance.subscription).toHaveBeenLastCalledWith('subscription-name')
      expect(fakeHandler.handle).toHaveBeenCalledTimes(1)
      expect(fakeHandler.handle).toHaveBeenCalledWith(expectedData)

      setTimeout(() => {
        expect(fakeMessage.ack).toHaveBeenCalledTimes(1)
        expect(fakeMessage.nack).not.toHaveBeenCalled()
      }, 10)
    })

    it('should nack and log the error message when handle throws the error', () => {
      const expectedError = Error('unable-to-handle')
      const fakeHandler = {
        handle: jest.fn().mockRejectedValue(expectedError),
      }

      clientPubSub.subscribe<MockMessageDto>('subscription-name', fakeHandler)
      fakeSubscription.emit('message', fakeMessage)

      expect(mockPubSubInstance.subscription).toHaveBeenCalledTimes(1)
      expect(mockPubSubInstance.subscription).toHaveBeenLastCalledWith('subscription-name')
      expect(fakeHandler.handle).toHaveBeenCalledTimes(1)
      expect(fakeHandler.handle).toHaveBeenCalledWith(expectedData)

      setTimeout(() => {
        expect(fakeMessage.nack).toHaveBeenCalledTimes(1)
        expect(fakeMessage.ack).not.toHaveBeenCalled()
      }, 10)
    })

    it('should log the error when subscription is out of service', () => {
      const fakeHandler = { handle: jest.fn() }
      const expectedError = new Error('subscription-error')

      clientPubSub.subscribe<MockMessageDto>('subscription-name', fakeHandler)
      fakeSubscription.emit('error', expectedError)

      expect(logger.error).toHaveBeenCalledTimes(1)
    })
  })

  describe('publish', () => {

    it('should publish given topicName and data', async () => {
      const mockPublishFunction = jest.fn()
      mockPubSubInstance.topic = jest.fn().mockReturnValueOnce({
        publish: mockPublishFunction,
      })
      const data = { id: 1 }
      const expectedDataPublish = Buffer.from(JSON.stringify(data))

      await clientPubSub.publish('topic-name', data)

      expect(mockPubSubInstance.topic).toHaveBeenCalledTimes(1)
      expect(mockPubSubInstance.topic).toHaveBeenLastCalledWith('topic-name')
      expect(mockPublishFunction).toHaveBeenCalledWith(expectedDataPublish)
      expect(mockPublishFunction).toHaveBeenCalledTimes(1)
    })

    it('should call logger error given publish error', async () => {
      const mockPublishFunction = jest.fn().mockRejectedValueOnce(new Error())
      mockPubSubInstance.topic = jest.fn().mockReturnValueOnce({
        publish: mockPublishFunction,
      })
      const data = { id: 1 }
      const expectedDataPublish = Buffer.from(JSON.stringify(data))

      await clientPubSub.publish('topic-name', data)

      expect(mockPubSubInstance.topic).toHaveBeenCalledTimes(1)
      expect(mockPubSubInstance.topic).toHaveBeenLastCalledWith('topic-name')
      expect(mockPublishFunction).toHaveBeenCalledWith(expectedDataPublish)
      expect(logger.error).toHaveBeenCalledTimes(1)
    })
  })
})
