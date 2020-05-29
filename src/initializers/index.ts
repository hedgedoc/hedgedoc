import { loadAllConfig } from './configLoader'
import { setUpI18n } from './i18n'

const customDelay: () => Promise<void> = async () => {
  if (window.localStorage.getItem('customDelay')) {
    return new Promise(resolve => setTimeout(resolve, 5000))
  } else {
    return Promise.resolve()
  }
}

export const setUp: (baseUrl: string) => Promise<void>[] = (baseUrl) => {
  return [setUpI18n(), loadAllConfig(baseUrl), customDelay()]
}
