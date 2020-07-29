import { getMe } from '../api/me'
import { setUser } from '../redux/user/methods'
import { store } from './store'

export const getAndSetUser: () => (Promise<void>) = async () => {
  const me = await getMe()
  setUser({
    id: me.id,
    name: me.name,
    photo: me.photo,
    provider: me.provider
  })
}

export const getApiUrl = (): string => {
  return store.getState().apiUrl.apiUrl
}

export const expectResponseCode = (response: Response, code = 200): void => {
  if (response.status !== code) {
    throw new Error(`response code is not ${code}`)
  }
}
