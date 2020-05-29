import { expectResponseCode, getBackendUrl } from '../utils/apiUtils'

export const getMe: (() => Promise<meResponse>) = async () => {
  const response = await fetch('/me')
  expectResponseCode(response)
  return (await response.json()) as meResponse
}

export interface meResponse {
  id: string
  name: string
  photo: string
}

export const postEmailLogin = async (email: string, password: string):Promise<void> => {
  const response = await fetch(getBackendUrl() + '/auth/email', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({
      email: email,
      password: password
    })
  })

  expectResponseCode(response)
}

export const postLdapLogin: ((email: string, password: string) => Promise<void>) = async (username, password) => {
  const response = await fetch(getBackendUrl() + '/auth/ldap', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({
      username: username,
      password: password
    })
  })

  expectResponseCode(response)
}

export const postOpenIdLogin: ((openid: string) => Promise<void>) = async (openId: string) => {
  const response = await fetch(getBackendUrl() + '/auth/openid', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({
      openId: openId
    })
  })

  expectResponseCode(response)
}
