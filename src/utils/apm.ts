import apm from 'elastic-apm-node'

interface configOptions {
    ignoreUrls: string[],
    secretToken: string,
    serverUrl: string,
    serviceName: string,
    environment: string,
}

export default function start(configOptions: configOptions): void{

  const acceptedAppEnv = [ 'production', 'development', 'staging' ]
  if (!acceptedAppEnv.includes(configOptions.environment)) {
    return
  }

  apm.start({ ...configOptions })
}
