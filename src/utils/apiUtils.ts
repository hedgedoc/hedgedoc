import { getMe } from '../api/user'
import { LoginStatus } from '../redux/user/types'
import { setUser } from '../redux/user/methods'
import { store } from './store'

export const getAndSetUser: () => (Promise<void>) = async () => {
  const me = await getMe()
  setUser({
    status: LoginStatus.ok,
    id: me.id,
    name: me.name,
    photo: me.photo
  })
}

export const getBackendUrl: (() => string) = () => {
  return store.getState().frontendConfig.backendUrl
}

export const expectResponseCode = (response: Response, code = 200): boolean => {
  return response.status !== code
}
