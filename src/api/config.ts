import { FrontendConfigState } from '../redux/frontend-config/types'
import { BackendConfigState } from '../redux/backend-config/types'
import { expectResponseCode, getBackendUrl } from '../utils/apiUtils'

export const getBackendConfig: () => Promise<BackendConfigState> = async () => {
  const response = await fetch(getBackendUrl() + '/backend-config.json')
  expectResponseCode(response)
  return await response.json() as Promise<BackendConfigState>
}

export const getFrontendConfig: () => Promise<FrontendConfigState> = async () => {
  const response = await fetch('config.json')
  expectResponseCode(response)
  return await response.json() as Promise<FrontendConfigState>
}
