import { GooglePubSub } from '@mq/client/pubsub'
import { PubSubClient } from '@mq/client/interfaces'
import { Logger } from '@utils/logger'
import { PubSub } from '@google-cloud/pubsub'

jest.mock('@google-cloud/pubsub')

describe('PubSub', () => {
  let clientPubSub: PubSubClient<unknown>
  let mockLogger: Logger
  let mockPubSubInstance: PubSub

  beforeEach(() => {
    mockLogger = {
      error: jest.fn(),
    } as unknown as Logger
    clientPubSub = new GooglePubSub({ projectId: 'project-id' }, mockLogger)
    mockPubSubInstance = (PubSub as unknown as jest.Mock).mock.instances[0]
  })

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('should subscribe given subscriptionName and messageHandler', () => {
    const mockMessageHandler = jest.fn()
    const mockOnFunction = jest.fn()
    mockPubSubInstance.subscription = jest.fn().mockReturnValueOnce({
      on: mockOnFunction,
    })

    clientPubSub.subscribe('subscription-name', mockMessageHandler)

    expect(mockPubSubInstance.subscription).toHaveBeenCalledTimes(1)
    expect(mockPubSubInstance.subscription).toHaveBeenLastCalledWith('subscription-name')
    expect(mockOnFunction).toHaveBeenNthCalledWith(1, 'message', expect.any(Function))
    expect(mockOnFunction).toHaveBeenNthCalledWith(2, 'error', expect.any(Function))
    expect(mockOnFunction).toHaveBeenCalledTimes(2)
  })

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
    expect(mockLogger.error).toHaveBeenCalledTimes(1)
  })
})
