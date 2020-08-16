import { getMe } from '../../../api/me'
import { setUser } from '../../../redux/user/methods'

export const getAndSetUser: () => (Promise<void>) = async () => {
  const me = await getMe()
  setUser({
    id: me.id,
    name: me.name,
    photo: me.photo,
    provider: me.provider
  })
}
