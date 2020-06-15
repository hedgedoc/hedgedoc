import { Action } from 'redux'

export enum BannerActionType {
  SET_BANNER = 'banner/set',
}

export interface BannerActions extends Action<BannerActionType> {
  type: BannerActionType;
}

export interface SetBannerAction extends BannerActions {
  state: BannerState;
}

export interface BannerState {
  show: boolean
  text: string
  timestamp: string
}
