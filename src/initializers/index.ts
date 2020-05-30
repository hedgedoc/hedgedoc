import { loadAllConfig } from './configLoader'
import { setUpI18n } from './i18n'

const customDelay: () => Promise<void> = async () => {
  if (window.localStorage.getItem('customDelay')) {
    return new Promise(resolve => setTimeout(resolve, 5000))
  } else {
    return Promise.resolve()
  }
}

export interface InitTask {
  name: string
  task: Promise<void>
}

export const setUp = (baseUrl: string): InitTask[] => {
  return [{
    name: 'Load Translations',
    task: setUpI18n()
  }, {
    name: 'Load config',
    task: loadAllConfig(baseUrl)
  }, {
    name: 'Add Delay',
    task: customDelay()
  }]
}
