import { Requester, Validator } from '@chainlink/ea-bootstrap'
import { ExecuteWithConfig, Config, InputParameters } from '@chainlink/types'

export const supportedEndpoints = ['height', 'difficulty']

export const endpointResultPaths = {
  height: 'height',
  difficulty: 'difficulty',
}

export const inputParameters: InputParameters = {
  resultPath: {
    aliases: ['field'],
    description:
      'The path for the result. When using `difficulty` or `height` the field will be filled as the endpoint.',
    type: 'string',
  },
}

export interface ResponseSchema {
  id: string
  height: number
  version: number
  timestamp: number
  tx_count: number
  size: number
  weight: number
  merkle_root: string
  previousblockhash: string
  mediantime: number
  nonce: number
  bits: number
  difficulty: number
}

export const execute: ExecuteWithConfig<Config> = async (request, _, config) => {
  const validator = new Validator(request, inputParameters)
  if (validator.error) throw validator.error

  const jobRunID = validator.validated.id
  const resultPath = validator.validated.data.resultPath
  const url = `/blocks`

  const options = {
    ...config.api,
    url,
    timeout: 10000,
  }

  const response = await Requester.request<ResponseSchema[]>(options)
  const result = Requester.validateResultNumber(response.data, [0, resultPath])

  return Requester.success(jobRunID, Requester.withResult(response, result), config.verbose)
}
