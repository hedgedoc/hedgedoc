import { expectResponseCode } from '../../utils/apiUtils'
import { FrontendConfig } from './types'

export const getFrontendConfig = async (baseUrl: string): Promise<FrontendConfig> => {
  const response = await fetch(`${baseUrl}config.json`)
  expectResponseCode(response)
  return await response.json() as Promise<FrontendConfig>
}
