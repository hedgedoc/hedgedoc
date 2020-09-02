import { UserResponse } from '../users/types'
import { expectResponseCode, getApiUrl, defaultFetchConfig } from '../utils'

export const getMe = async (): Promise<UserResponse> => {
  const response = await fetch(getApiUrl() + '/me', {
    ...defaultFetchConfig
  })
  expectResponseCode(response)
  return (await response.json()) as UserResponse
}

export const updateDisplayName = async (displayName: string): Promise<void> => {
  const response = await fetch(getApiUrl() + '/me', {
    ...defaultFetchConfig,
    method: 'POST',
    body: JSON.stringify({
      name: displayName
    })
  })

  expectResponseCode(response)
}

export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  const response = await fetch(getApiUrl() + '/me/password', {
    ...defaultFetchConfig,
    method: 'POST',
    body: JSON.stringify({
      oldPassword,
      newPassword
    })
  })

  expectResponseCode(response)
}

export const deleteUser = async (): Promise<void> => {
  const response = await fetch(getApiUrl() + '/me', {
    ...defaultFetchConfig,
    method: 'DELETE'
  })

  expectResponseCode(response)
}
