import { Reducer } from 'redux'
import { determineDarkModeBrowserSetting, loadFromLocalStorage, saveToLocalStorage } from './methods'
import { DarkModeConfig, DarkModeConfigActions, DarkModeConfigActionType, SetDarkModeConfigAction } from './types'

export const getInitialState = (): DarkModeConfig => {
  const initialMode = loadFromLocalStorage() ?? determineDarkModeBrowserSetting() ?? {
    darkMode: false
  }
  saveToLocalStorage(initialMode)
  return initialMode
}

export const DarkModeConfigReducer: Reducer<DarkModeConfig, DarkModeConfigActions> = (state: DarkModeConfig = getInitialState(), action: DarkModeConfigActions) => {
  let darkModeConfigState: DarkModeConfig
  switch (action.type) {
    case DarkModeConfigActionType.SET_DARK_MODE:
      darkModeConfigState = {
        ...state,
        darkMode: (action as SetDarkModeConfigAction).darkMode
      }
      saveToLocalStorage(darkModeConfigState)
      return darkModeConfigState
    default:
      return state
  }
}
