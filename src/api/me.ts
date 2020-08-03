import { LoginProvider } from '../redux/user/types'
import { expectResponseCode, getApiUrl } from '../utils/apiUtils'
import { defaultFetchConfig } from './default'

export const getMe = async (): Promise<meResponse> => {
  const response = await fetch(getApiUrl() + '/me', {
    ...defaultFetchConfig
  })
  expectResponseCode(response)
  return (await response.json()) as meResponse
}

export interface meResponse {
  id: string
  name: string
  photo: string
  provider: LoginProvider
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
