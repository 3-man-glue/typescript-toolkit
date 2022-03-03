import { Logger } from '@utils/logger'
import { Scheduler } from '@scheduler/scheduler'
import { ScheduleHandler } from '@scheduler/interfaces'
import Container from 'typedi'
import cron from 'node-cron'

class MockScheduleHandler implements ScheduleHandler {
  handle(): Promise<void> {
    return Promise.resolve()
  }
}
describe('Scheduler', () => {
  const mockLogger = { error: jest.fn() } as unknown as Logger
  let scheduler: Scheduler
  let mockScheduleHandler: MockScheduleHandler
  const mockSchedule: jest.SpyInstance = jest.spyOn(cron, 'schedule')

  beforeEach(() => {
    mockScheduleHandler = {
      handle: jest.fn(),
    } as unknown as MockScheduleHandler

    Container.set(MockScheduleHandler, mockScheduleHandler)
    scheduler = Scheduler.create(mockLogger)
  })

  afterEach(() => {
    Container.reset()
    jest.resetModules()
    jest.clearAllMocks()
    scheduler.stop()
  })
  describe('setLoaderFunction', () => {
    it('should call loader function given set loader function', async () => {
      const mockLoader = jest.fn()

      await scheduler.setLoaderFunction(mockLoader).start()

      expect(mockLoader).toHaveBeenCalledTimes(1)
    })

    it('should log error given loader got error', async () => {
      const mockLoader = jest.fn().mockRejectedValueOnce(new Error('loader-error'))

      await scheduler.setLoaderFunction(mockLoader).start()

      expect(mockLogger.error).toHaveBeenCalledTimes(1)
    })
  })

  describe('registerTask', () => {
    it('should scheduler register task', async () => {
      process.env['SCHEDULER_TEST'] = '0 1 * * *'

      await scheduler.registerTask('TEST', MockScheduleHandler).start()

      expect(mockSchedule).toHaveBeenCalledTimes(1)
      expect(mockSchedule).toHaveBeenCalledWith('0 1 * * *', expect.any(Function))
    })

    it('should scheduler register task given Handler is not IOC', async () => {
      process.env['SCHEDULER_TEST'] = '0 1 * * *'
      const MockScheduleHandler = jest.fn(() => ({
        handle: jest.fn(),
      }))

      await scheduler.registerTask('TEST', MockScheduleHandler).start()

      expect(mockSchedule).toHaveBeenCalledTimes(1)
      expect(mockSchedule).toHaveBeenCalledWith('0 1 * * *', expect.any(Function))
    })

    it('should scheduler register 2 tasks', async () => {
      process.env['SCHEDULER_TEST'] = '0 1 * * *'
      process.env['SCHEDULER_TEST_2'] = '0 2 * * *'

      await scheduler.registerTask('TEST', MockScheduleHandler).registerTask('TEST_2', MockScheduleHandler).start()

      expect(mockSchedule).toHaveBeenCalledTimes(2)
      expect(mockSchedule).toHaveBeenNthCalledWith(1, '0 1 * * *', expect.any(Function))
      expect(mockSchedule).toHaveBeenNthCalledWith(2, '0 2 * * *', expect.any(Function))
    })

    it('should log error given not found expression cron', async () => {
      let isThrown = false

      try {
        await scheduler.registerTask('NOT_FOUND', MockScheduleHandler).start()
      } catch (error) {
        isThrown = true

        expect(mockLogger.error).toHaveBeenCalledTimes(1)
        expect(mockLogger.error).toHaveBeenCalledWith('Schedule expression not exist: NOT_FOUND')
      }

      expect(isThrown).toBeTruthy()
    })

    it('should log error given invalid cron expression', async () => {
      process.env['SCHEDULER_INVALID'] = 'invalid_cron_expression'

      let isThrown = false

      try {
        await scheduler.registerTask('INVALID', MockScheduleHandler).start()
      } catch (error) {
        isThrown = true

        expect(mockLogger.error).toHaveBeenCalledTimes(1)
        expect(mockLogger.error).toHaveBeenCalledWith('Schedule expression is invalid: invalid_cron_expression')
      }

      expect(isThrown).toBeTruthy()
    })
  })

  describe('removeTask', () => {
    it('should throw error given remove task non exist task', async () => {
      process.env['SCHEDULER_TEST'] = '0 1 * * *'
      let isThrown = false

      await scheduler.registerTask('TEST', MockScheduleHandler).start()

      try {
        scheduler.removeTask('NON_EXIST')
      } catch (error) {
        isThrown = true
        expect(error.message).toBe('Remove task not exist')
      }

      expect(isThrown).toBeTruthy()
    })

    it('should remove task given properly name', async () => {
      process.env['SCHEDULER_TEST'] = '0 1 * * *'
      const mockStop = jest.fn()
      mockSchedule.mockReturnValueOnce({
        stop: mockStop,
        start: jest.fn(),
      })

      await scheduler.registerTask('TEST', MockScheduleHandler).start()
      scheduler.removeTask('TEST')

      expect(mockStop).toHaveBeenCalledTimes(1)
    })
  })

  describe('stop', () => {
    it('should stop all active tasks', async () => {
      process.env['SCHEDULER_TEST'] = '0 1 * * *'
      process.env['SCHEDULER_TEST_2'] = '0 2 * * *'
      const mockStop = jest.fn()
      mockSchedule.mockReturnValue({
        stop: mockStop,
        start: jest.fn(),
      })

      await scheduler.registerTask('TEST', MockScheduleHandler).registerTask('TEST_2', MockScheduleHandler).start()
      scheduler.stop()

      expect(mockStop).toHaveBeenCalledTimes(2)
    })
  })
})
