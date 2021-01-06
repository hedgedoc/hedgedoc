/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { store } from '..'
import { ApiUrlActionType, ApiUrlObject, SetApiUrlAction } from './types'

export const setApiUrl = (state: ApiUrlObject): void => {
  const action: SetApiUrlAction = {
    type: ApiUrlActionType.SET_API_URL,
    state
  }
  store.dispatch(action)
}
