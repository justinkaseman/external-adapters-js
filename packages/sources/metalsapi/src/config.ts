import { Requester } from '@chainlink/ea-bootstrap'
import { Config } from '@chainlink/types'

export const NAME = 'METALSAPI'

export const DEFAULT_BASE_URL = 'https://metals-api.com/api/'
export const DEFAULT_ENDPOINT = 'latest'

export const makeConfig = (prefix = ''): Config => {
  const config = Requester.getDefaultConfig(prefix, true)
  config.api.headers['x-api-key'] = config.apiKey
  config.api.baseURL = config.api.baseURL || DEFAULT_BASE_URL
  config.defaultEndpoint = DEFAULT_ENDPOINT
  return config
}
