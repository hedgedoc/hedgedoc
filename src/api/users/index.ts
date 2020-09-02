import { defaultFetchConfig, expectResponseCode, getApiUrl } from '../utils'
import { UserResponse } from './types'

export const getUserById = async (userid: string): Promise<UserResponse> => {
  const response = await fetch(`${getApiUrl()}/users/${userid}`, {
    ...defaultFetchConfig
  })
  expectResponseCode(response)
  return (await response.json()) as UserResponse
}
