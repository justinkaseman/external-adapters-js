import { Validator } from '@chainlink/ea-bootstrap'
import { Config, ExecuteWithConfig, InputParameters } from '@chainlink/types'

export const supportedEndpoints = ['crypto']

export const inputParameters: InputParameters = {
  base: {
    aliases: ['from', 'coin'],
    description: 'The symbol of the currency to query',
    required: true,
  },
  quote: {
    aliases: ['to', 'market'],
    description: 'The symbol of the currency to convert to',
    required: true,
  },
}

export const execute: ExecuteWithConfig<Config> = async (request) => {
  const validator = new Validator(request, inputParameters)
  if (validator.error) throw validator.error
  throw Error(
    'The NCFX adapter does not support making HTTP requests. Make sure WS is enabled in the adapter configuration.',
  )
}
