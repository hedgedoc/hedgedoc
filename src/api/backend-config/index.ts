import { expectResponseCode, getBackendUrl } from '../../utils/apiUtils'
import { BackendConfig } from './types'

export const getBackendConfig = async (): Promise<BackendConfig> => {
  const response = await fetch(getBackendUrl() + '/config')
  expectResponseCode(response)
  return await response.json() as Promise<BackendConfig>
}
