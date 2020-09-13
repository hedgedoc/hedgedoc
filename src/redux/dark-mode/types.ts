import { Action } from 'redux'

export enum DarkModeConfigActionType {
  SET_DARK_MODE = 'dark-mode/set',
}

export interface DarkModeConfig {
  darkMode: boolean
}

export interface DarkModeConfigActions extends Action<DarkModeConfigActionType> {
  type: DarkModeConfigActionType
}

export interface SetDarkModeConfigAction extends DarkModeConfigActions {
  darkMode: boolean
}
