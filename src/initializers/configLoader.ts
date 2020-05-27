import { getBackendConfig, getFrontendConfig } from '../api/config'
import { setFrontendConfig } from '../redux/frontend-config/methods'
import { setBackendConfig } from '../redux/backend-config/methods'
import { getAndSetUser } from '../utils/apiUtils'

export const loadAllConfig: () => Promise<void> = async () => {
  const frontendConfig = await getFrontendConfig()
  if (!frontendConfig) {
    return Promise.reject(new Error('Frontend config empty!'))
  }
  setFrontendConfig(frontendConfig)

  const backendConfig = await getBackendConfig()
  if (!backendConfig) {
    return Promise.reject(new Error('Backend config empty!'))
  }
  setBackendConfig(backendConfig)

  await getAndSetUser()
}
