/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Reducer } from 'redux'
import { BannerActions, BannerActionType, BannerState } from './types'

export const initialState: BannerState = {
  text: undefined,
  lastModified: null
}

export const BannerReducer: Reducer<BannerState, BannerActions> = (
  state: BannerState = initialState,
  action: BannerActions
) => {
  switch (action.type) {
    case BannerActionType.SET_BANNER:
      return action.state
    default:
      return state
  }
}
