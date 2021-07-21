/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Action } from 'redux'

export enum BannerActionType {
  SET_BANNER = 'banner/set'
}

export type BannerActions = SetBannerAction

export interface SetBannerAction extends Action<BannerActionType> {
  type: BannerActionType.SET_BANNER
  state: BannerState
}

export interface BannerState {
  text: string | undefined
  lastModified: string | null
}
