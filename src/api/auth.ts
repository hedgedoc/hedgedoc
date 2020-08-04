import { RegisterError } from '../components/landing/pages/register/register'
import { expectResponseCode, getApiUrl } from '../utils/apiUtils'
import { defaultFetchConfig } from './default'

export const doInternalLogin = async (username: string, password: string): Promise<void> => {
  const response = await fetch(getApiUrl() + '/auth/internal', {
    ...defaultFetchConfig,
    method: 'POST',
    body: JSON.stringify({
      username: username,
      password: password
    })
  })

  expectResponseCode(response)
}

export const doInternalRegister = async (username: string, password: string): Promise<void> => {
  const response = await fetch(getApiUrl() + '/auth/register', {
    ...defaultFetchConfig,
    method: 'POST',
    body: JSON.stringify({
      username: username,
      password: password
    })
  })

  if (response.status === 409) {
    throw new Error(RegisterError.USERNAME_EXISTING)
  }

  expectResponseCode(response)
}

export const doLdapLogin = async (username: string, password: string): Promise<void> => {
  const response = await fetch(getApiUrl() + '/auth/ldap', {
    ...defaultFetchConfig,
    method: 'POST',
    body: JSON.stringify({
      username: username,
      password: password
    })
  })

  expectResponseCode(response)
}

export const doOpenIdLogin = async (openId: string): Promise<void> => {
  const response = await fetch(getApiUrl() + '/auth/openid', {
    ...defaultFetchConfig,
    method: 'POST',
    body: JSON.stringify({
      openId: openId
    })
  })

  expectResponseCode(response)
}
