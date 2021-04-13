import { viewSystemUsage } from 'libs/system-usage'

describe('System usage', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  test('run properly', () => {
    const result = viewSystemUsage()

    expect(result.timestamp).toBe(Date.now())
    expect(result.cpu).toBeDefined()
    expect(result.memory).toBeDefined()
    expect(result.resource).toBeDefined()
  })
})
