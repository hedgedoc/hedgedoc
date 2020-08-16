import { getConfig } from '../../../api/config'
import { setApiUrl } from '../../../redux/api-url/methods'
import { setBanner } from '../../../redux/banner/methods'
import { setConfig } from '../../../redux/config/methods'
import { getAndSetUser } from '../../login-page/auth/utils'

export const loadAllConfig: (baseUrl: string) => Promise<void> = async (baseUrl) => {
  setApiUrl({
    apiUrl: (process.env.REACT_APP_BACKEND || baseUrl) + '/api/v2'
  })

  const config = await getConfig()
  if (!config) {
    return Promise.reject(new Error('Config empty!'))
  }
  setConfig(config)

  const banner = config.banner
  if (banner.text !== '') {
    const lastAcknowledgedTimestamp = window.localStorage.getItem('bannerTimeStamp') || ''
    setBanner({
      ...banner,
      show: banner.text !== '' && banner.timestamp !== lastAcknowledgedTimestamp
    })
  }

  await getAndSetUser()
}
