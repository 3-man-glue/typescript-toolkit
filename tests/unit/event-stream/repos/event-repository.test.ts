import { Engine } from '@db/engine/interfaces'
import { Operation } from '@db/interfaces'
import { Event } from '@event-stream/models/event'
import { EventRepository } from '@event-stream/repos/event-repository'

describe('Event Repository', () => {
  let mockEngine: Engine
  let eventRepo: EventRepository

  beforeEach(() => {
    mockEngine = {
      select: jest.fn(),
      insert: jest.fn(),
    } as unknown as Engine
    eventRepo = new EventRepository(mockEngine)

    jest.useFakeTimers('legacy')
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    jest.useRealTimers()
  })

  describe('getByAggregateRoot', () => {
    it('should return event given found', async () => {
      const expectedParams = {
        root_id: { [Operation.EQ]: 'BDC:001' },
      }
      const expectedState = {
        rootId: 'BDC:001',
        subjectId: 'subject-001',
        eventId: 'event-001',
        subject: 'subject-001',
        params: { id: 'subject-001' },
        context: { data: 'context-001' },
        action: 'fake-action',
        actor: {
          id: 'actor-001',
          alias: 'alias-001',
          externalId: 'externalId-001',
          role: {
            externalRole: 'externalRole-001',
            role: 'admin',
          },
        },
        timestamp: new Date(),
        createdAt: new Date(),
      }
      jest.spyOn(mockEngine, 'select').mockResolvedValue([
        {
          id: 'EV:001',
          root_id: 'BDC:001',
          subject_id: 'subject-001',
          event_id: 'event-001',
          subject: 'subject-001',
          params: '{"id":"subject-001"}',
          context: '{"data":"context-001"}',
          action: 'fake-action',
          actor: {
            id: 'actor-001',
            alias: 'alias-001',
            external_id: 'externalId-001',
            role: {
              external_role: 'externalRole-001',
              role: 'admin',
            },
          },
          timestamp: Date.now(),
          created_at: Date.now(),
        },
      ])

      const event = (await eventRepo.getByAggregateRoot('BDC:001'))[0] as Event

      expect(mockEngine.select).toHaveBeenCalledTimes(1)
      expect(mockEngine.select).toHaveBeenCalledWith(expectedParams, 'event')
      expect(event).toBeInstanceOf(Event)
      expect(event.state).toStrictEqual(expectedState)
    })

    it('should an empty event when event is not found', async () => {
      jest.spyOn(mockEngine, 'select').mockResolvedValue([])

      const events = await eventRepo.getByAggregateRoot('BDC:001')

      expect(events).toBeInstanceOf(Array)
      expect(events).toStrictEqual([])
    })

    it('should throw error given cassandra error', async () => {
      let isThrown = true
      const mockError = new Error('Cassandra-error')
      jest.spyOn(mockEngine, 'select').mockRejectedValueOnce(mockError)

      try {
        await eventRepo.getByAggregateRoot('BDC:001')
      } catch (error) {
        isThrown = true
        expect(error).toStrictEqual(mockError)
      }

      expect(isThrown).toBeTruthy()
    })
  })

  describe('save', () => {
    const event = new Event({
      rootId: 'BDC:001',
      subjectId: 'subject-001',
      eventId: 'event-001',
      subject: 'subject-001',
      params: { id: 'subject-001' },
      context: { data: 'fake-context' },
      action: 'fake-action',
      actor: {
        id: 'actor-001',
        alias: 'alias-001',
        externalId: 'externalId-001',
        role: {
          externalRole: 'externalRole-001',
          role: 'admin',
        },
      },
      timestamp: new Date(),
      createdAt: new Date(),
    })

    it('should save event', async () => {
      jest.spyOn(mockEngine, 'insert')
      const expectedParams = {
        root_id: 'BDC:001',
        subject_id: 'subject-001',
        event_id: 'event-001',
        subject: 'subject-001',
        params: '{"id":"subject-001"}',
        context: '{"data":"fake-context"}',
        action: 'fake-action',
        actor: {
          id: 'actor-001',
          alias: 'alias-001',
          external_id: 'externalId-001',
          role: {
            external_role: 'externalRole-001',
            role: 'admin',
          },
        },
        timestamp: Date.now(),
        created_at: Date.now(),
      }

      await eventRepo.save(event)

      expect(mockEngine.insert).toHaveBeenCalledTimes(1)
      expect(mockEngine.insert).toHaveBeenCalledWith([ expectedParams ], 'event')
    })

    it('should throw error given cassandra error', async () => {
      let isThrown = true
      const mockError = new Error('Cassandra-error')
      jest.spyOn(mockEngine, 'insert').mockRejectedValueOnce(mockError)

      try {
        await eventRepo.save(event)
      } catch (error) {
        isThrown = true
        expect(error).toStrictEqual(mockError)
      }

      expect(isThrown).toBeTruthy()
    })
  })
})
