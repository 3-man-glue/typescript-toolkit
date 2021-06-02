import { viewSystemUsage } from 'libs/system-usage'

describe('System usage', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
  })

  it('Should return system usage data', () => {
    jest.spyOn(process, 'cpuUsage').mockReturnValue({ k: 'cpu' } as unknown as NodeJS.CpuUsage)
    jest.spyOn(process, 'memoryUsage').mockReturnValue({ k: 'memory' } as unknown as NodeJS.MemoryUsage)
    jest.spyOn(process, 'resourceUsage').mockReturnValue({ k: 'resource' } as unknown as NodeJS.ResourceUsage)

    const expectedResult = {
      timestamp: Date.now(),
      cpu: { k: 'cpu' },
      memory: { k: 'memory' },
      resource: { k: 'resource' },
    }

    const result = viewSystemUsage()

    expect(result).toStrictEqual(expectedResult)
  })
})
