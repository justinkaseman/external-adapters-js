import {
  AdapterRequest,
  AdapterResponse,
  APIEndpoint,
  ExecuteWithConfig,
  MakeWSHandler,
  ExecuteFactory,
} from '@chainlink/types'
import { Builder, Requester, Validator } from '@chainlink/ea-bootstrap'
import { makeConfig, DEFAULT_WS_API_ENDPOINT, NAME, Config } from './config'
import * as endpoints from './endpoint'
import { inputParameters } from './endpoint/price'

export const execute: ExecuteWithConfig<Config> = async (request, context, config) => {
  return Builder.buildSelector(request, context, config, endpoints)
}

export const endpointSelector = (request: AdapterRequest): APIEndpoint<Config> =>
  Builder.selectEndpoint(request, makeConfig(), endpoints)

export const makeExecute: ExecuteFactory<Config> = (config) => {
  return async (request, context) => execute(request, context, config || makeConfig())
}

export const makeWSHandler = (config?: Config): MakeWSHandler => {
  // http://api.tradingeconomics.com/documentation/Streaming
  // https://github.com/boxhock/tradingeconomics-nodejs-stream/blob/master/src/index.ts
  const withApiKey = (url: string, key: string, secret: string) => `${url}?client=${key}:${secret}`
  const getSubscription = (to: string) => ({ topic: 'subscribe', to })

  return () => {
    const defaultConfig = config || makeConfig()

    return {
      connection: {
        url: withApiKey(
          defaultConfig.api.baseWsURL || DEFAULT_WS_API_ENDPOINT,
          defaultConfig.client.key || '',
          defaultConfig.client.secret || '',
        ),
      },
      subscribe: (input) => {
        const validator = new Validator(input, inputParameters, {}, false)
        if (validator.error) {
          return
        }
        const base = (validator.overrideSymbol(NAME) as string).toUpperCase()
        return getSubscription(base)
      },
      unsubscribe: () => undefined,
      subsFromMessage: (message) => getSubscription(message?.s),
      isError: (message: any) => Number(message.TYPE) > 400 && Number(message.TYPE) < 900,
      filter: (message) => {
        return message.topic && message.topic !== 'keepalive'
      },
      toResponse: (wsResponse: any): AdapterResponse =>
        Requester.success(undefined, { data: { result: wsResponse?.price } }),
    }
  }
}
