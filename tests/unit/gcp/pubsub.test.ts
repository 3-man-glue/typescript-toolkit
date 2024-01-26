import EventEmitter from 'events'
import { PubSub, Message as PubSubMessage } from '@google-cloud/pubsub'
import { PubSubAdapter } from '@gcp/pubsub'
import { MessageDto } from '@mq/interfaces'
import logger from '@utils/logger'

jest.mock('@google-cloud/pubsub')
jest.mock('@utils/logger')

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface MockMessageDto extends MessageDto { }

describe('PubSub', () => {
  let clientPubSub: PubSubAdapter
  let fakeSubscription: EventEmitter
  let mockPubSubInstance: PubSub

  beforeEach(() => {
    clientPubSub = new PubSubAdapter()

    fakeSubscription = new EventEmitter()
    mockPubSubInstance = ((PubSub as unknown) as jest.Mock).mock.instances[0]
    mockPubSubInstance.subscription = jest.fn().mockReturnValue(fakeSubscription)
  })

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('getTopicMetaData', () => {
    it('should return metadata properly', async () => {
      const expectedMetadata = [
        {
          labels: {},
          name: 'projects/testing-pubsub/topics/topic-name',
          messageStoragePolicy: null,
          kmsKeyName: '',
          schemaSettings: null,
          satisfiesPzs: false,
          messageRetentionDuration: null,
        },
      ]
      const mockGetMetadataFunction = jest.fn().mockResolvedValueOnce(expectedMetadata)
      mockPubSubInstance.topic = jest.fn().mockReturnValueOnce({
        getMetadata: mockGetMetadataFunction,
      })

      const metadata = await clientPubSub.getTopicMetadata('topic-name')

      expect(mockGetMetadataFunction).toHaveBeenCalledTimes(1)
      expect(metadata).toStrictEqual(expectedMetadata)
    })

    it('should throw when it cannot resolve metadata', async () => {
      const expectedError = new Error('cannot resolve metadata')
      const mockGetMetadataFunction = jest.fn().mockRejectedValueOnce(expectedError)
      mockPubSubInstance.topic = jest.fn().mockReturnValueOnce({
        getMetadata: mockGetMetadataFunction,
      })
      let isThrown = false

      try {
        await clientPubSub.getTopicMetadata('topic-name')
      } catch (error) {
        expect(error).toStrictEqual(expectedError)
        isThrown = true
      }

      expect(isThrown).toBeTruthy()
    })
  })

  describe('testPermissions', () => {
    it('should return a map of permissions', async () => {
      const expectedPermissions = { 'pubsub.topics.publish': true }
      const mockTestPermissionsFunction = jest.fn().mockReturnValueOnce([ expectedPermissions ])
      mockPubSubInstance.topic = jest.fn().mockReturnValueOnce({
        iam: {
          testPermissions: mockTestPermissionsFunction,
        },
      })

      const permissions = await clientPubSub.testPermissions('testing-topic', [ 'pubsub.topics.publish' ])

      expect(permissions).toStrictEqual(expectedPermissions)
      expect(mockPubSubInstance.topic).toBeCalledWith('testing-topic')
    })

    it('should throw an error when it cannot test the permissions', async () => {
      const expectedError = new Error('Cannot test the permissions')
      const mockTestPermissionsFunction = jest.fn().mockRejectedValueOnce(expectedError)
      let isThrown = false
      mockPubSubInstance.topic = jest.fn().mockReturnValueOnce({
        iam: {
          testPermissions: mockTestPermissionsFunction,
        },
      })

      try {
        await clientPubSub.testPermissions('testing-topic', [ 'pubsub.topics.publish' ])
      } catch (error) {
        expect(error).toStrictEqual(expectedError)
        isThrown = true
      }

      expect(isThrown).toBeTruthy()
    })
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
      mockPubSubInstance.getTopics = jest
        .fn()
        .mockReturnValueOnce([ [ { name: 'projects/testing-pubsub/topics/existed-topic' } ] ])
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

      fakeMessage = ({
        data: dataBuffer,
        ack: jest.fn(),
        nack: jest.fn(),
      } as unknown) as PubSubMessage
    })

    it('should subscribe given subscriptionName and messageHandler', async () => {
      const fakeHandler = { handle: jest.fn().mockResolvedValue({}) }

      clientPubSub.subscribe<MockMessageDto>('subscription-name', [ fakeHandler ])
      fakeSubscription.emit('message', fakeMessage)

      expect(mockPubSubInstance.subscription).toHaveBeenCalledTimes(1)
      expect(mockPubSubInstance.subscription).toHaveBeenLastCalledWith('subscription-name')
      expect(fakeHandler.handle).toHaveBeenCalledTimes(1)
      expect(fakeHandler.handle).toHaveBeenCalledWith(expectedData)

      await new Promise((resolve) => setTimeout(resolve, 200))

      expect(fakeMessage.ack).toHaveBeenCalledTimes(1)
      expect(fakeMessage.nack).not.toHaveBeenCalled()
    })

    it('should nack and log the error message when handle throws the error', async () => {
      const expectedError = Error('unable-to-handle')
      const fakeHandler = {
        handle: jest.fn().mockRejectedValue(expectedError),
      }

      clientPubSub.subscribe<MockMessageDto>('subscription-name', [ fakeHandler ])
      fakeSubscription.emit('message', fakeMessage)

      expect(mockPubSubInstance.subscription).toHaveBeenCalledTimes(1)
      expect(mockPubSubInstance.subscription).toHaveBeenLastCalledWith('subscription-name')
      expect(fakeHandler.handle).toHaveBeenCalledTimes(1)
      expect(fakeHandler.handle).toHaveBeenCalledWith(expectedData)

      await new Promise((resolve) => setTimeout(resolve, 200))

      expect(fakeMessage.nack).toHaveBeenCalledTimes(1)
      expect(fakeMessage.ack).not.toHaveBeenCalled()
    })

    it('should log the error when subscription is out of service', () => {
      const fakeHandler = { handle: jest.fn() }
      const expectedError = new Error('subscription-error')

      clientPubSub.subscribe<MockMessageDto>('subscription-name', [ fakeHandler ])
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
