/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { store } from '..'
import type { ApiUrlObject, SetApiUrlAction } from './types'
import { ApiUrlActionType } from './types'

export const setApiUrl = (state: ApiUrlObject): void => {
  store.dispatch({
    type: ApiUrlActionType.SET_API_URL,
    state
  } as SetApiUrlAction)
}
