/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { store } from '..'
import { BannerActionType, BannerState, SetBannerAction } from './types'

export const setBanner = (state: BannerState): void => {
  store.dispatch({
    type: BannerActionType.SET_BANNER,
    state
  } as SetBannerAction)
}
