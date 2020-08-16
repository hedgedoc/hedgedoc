import { store } from '..'
import { BannerActionType, BannerState, SetBannerAction } from './types'

export const setBanner = (state: BannerState): void => {
  const action: SetBannerAction = {
    type: BannerActionType.SET_BANNER,
    state
  }
  store.dispatch(action)
}
