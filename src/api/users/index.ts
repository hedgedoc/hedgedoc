import { Cache } from '../../components/common/cache/cache'
import { defaultFetchConfig, expectResponseCode, getApiUrl } from '../utils'
import { UserResponse } from './types'

const cache = new Cache<string, UserResponse>(600)

export const getUserById = async (userid: string): Promise<UserResponse> => {
  if (cache.has(userid)) {
    return cache.get(userid)
  }
  const response = await fetch(`${getApiUrl()}/users/${userid}`, {
    ...defaultFetchConfig
  })
  expectResponseCode(response)
  const userData = (await response.json()) as UserResponse
  cache.put(userid, userData)
  return userData
}
