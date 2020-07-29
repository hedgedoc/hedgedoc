import { expectResponseCode, getApiUrl } from '../utils/apiUtils'
import { defaultFetchConfig } from './default'

export const doEmailLogin = async (email: string, password: string): Promise<void> => {
  const response = await fetch(getApiUrl() + '/auth/email', {
    ...defaultFetchConfig,
    method: 'POST',
    body: JSON.stringify({
      email: email,
      password: password
    })
  })

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
