import { Requester, Validator } from '@chainlink/ea-bootstrap'
import { ExecuteWithConfig, Config, InputParameters } from '@chainlink/types'

export const supportedEndpoints = ['assets', 'dominance']

export const endpointResultPaths = {
  dominance: 'marketcap.marketcap_dominance_percent',
  assets: 'marketcap.marketcap_dominance_percent',
}

export const inputParameters: InputParameters = {
  base: {
    required: true,
    aliases: ['market', 'to', 'quote'],
    type: 'string',
    description: 'The symbol of the currency to',
  },
  resultPath: {
    required: false,
    description:
      'The object path to access the value that will be returned as the result. Deeply nested values can be accessed with a `.` delimiter.',
    type: 'string',
    default: 'marketcap.marketcap_dominance_percent',
  },
}

export interface ResponseSchema {
  status: {
    elapsed: number
    timestamp: string
  }
  data: {
    id: string
    symbol: string
    name: string
    slug: string
    contract_addresses: string
    _internal_temp_agora_id: string
    market_data: Record<string, number | string | Record<string, number>>
    marketcap: {
      rank: number
      marketcap_dominance_percent: number
      current_marketcap_usd: number
      y_2050_marketcap_usd: number
      y_plus10_marketcap_usd: number
      liquid_marketcap_usd: number
      volume_turnover_last_24_hours_percent: number
      realized_marketcap_usd: number
      outstanding_marketcap_usd: number
    }
    supply: Record<string, number>
    blockchain_stats_24_hours: Record<string, number>
    all_time_high: Record<string, number | string>
    cycle_low: Record<string, number | string>
    supply_activity: Record<string, number>
  }
}

export const execute: ExecuteWithConfig<Config> = async (request, _, config) => {
  const validator = new Validator(request, inputParameters)
  if (validator.error) throw validator.error

  const jobRunID = validator.validated.id
  const base = validator.validated.data.base.toLowerCase()
  const resultPath = validator.validated.data.resultPath
  const url = `assets/${base}/metrics`

  const options = {
    ...config.api,
    url,
  }

  const response = await Requester.request<ResponseSchema>(options)
  const result = Requester.validateResultNumber(response.data, ['data', resultPath])

  return Requester.success(jobRunID, Requester.withResult(response, result), config.verbose)
}
