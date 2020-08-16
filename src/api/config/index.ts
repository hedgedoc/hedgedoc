import { expectResponseCode, getApiUrl, defaultFetchConfig } from '../utils'
import { Config } from './types'

export const getConfig = async (): Promise<Config> => {
  const response = await fetch(getApiUrl() + '/config', {
    ...defaultFetchConfig
  })
  expectResponseCode(response)
  return await response.json() as Promise<Config>
}
