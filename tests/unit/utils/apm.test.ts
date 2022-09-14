import startApm from '@utils/apm'
import apm from 'elastic-apm-node'

jest.mock('elastic-apm-node', () => ({ start: jest.fn() }))

describe('apm', () => {

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it.each([ 'production', 'development', 'staging' ])('should call start apm '
    + 'when given config properly and environment is %s', (enviroment) => {
    const configOptions = {
      ignoreUrls: [  '/user/health' ],
      secretToken: 'secretToken',
      serverUrl: 'serverUrl',
      serviceName: 'serviceName',
      environment: enviroment,
    }

    startApm(configOptions)

    expect(apm.start).toHaveBeenCalledTimes(1)
    expect(apm.start).toHaveBeenCalledWith({ ...configOptions })
  })

  it('should not call start apm when environment is not `production`,`development` and `staging`', () => {
    const configOptions = {
      ignoreUrls: [  '/user/health' ],
      secretToken: 'secretToken',
      serverUrl: 'serverUrl',
      serviceName: 'serviceName',
      environment: 'local',
    }

    startApm(configOptions)

    expect(apm.start).toHaveBeenCalledTimes(0)
  })

})
