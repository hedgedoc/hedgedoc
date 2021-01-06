/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
