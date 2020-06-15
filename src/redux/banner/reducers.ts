import { Reducer } from 'redux'
import {
  BannerActions,
  BannerActionType,
  BannerState,
  SetBannerAction
} from './types'

export const initialState: BannerState = {
  show: true,
  text: '',
  timestamp: ''
}

export const BannerReducer: Reducer<BannerState, BannerActions> = (state: BannerState = initialState, action: BannerActions) => {
  switch (action.type) {
    case BannerActionType.SET_BANNER:
      return (action as SetBannerAction).state
    default:
      return state
  }
}
