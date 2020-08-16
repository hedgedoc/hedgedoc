import { store } from '../redux'

export const defaultFetchConfig: Partial<RequestInit> = {
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json'
  },
  redirect: 'follow',
  referrerPolicy: 'no-referrer'
}

export const getApiUrl = (): string => {
  return store.getState().apiUrl.apiUrl
}

export const expectResponseCode = (response: Response, code = 200): void => {
  if (response.status !== code) {
    throw new Error(`response code is not ${code}`)
  }
}
