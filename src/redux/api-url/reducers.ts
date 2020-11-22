/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Reducer } from 'redux'
import { ApiUrlActions, ApiUrlActionType, ApiUrlObject, SetApiUrlAction } from './types'

export const initialState: ApiUrlObject = {
  apiUrl: ''
}

export const ApiUrlReducer: Reducer<ApiUrlObject, ApiUrlActions> = (state: ApiUrlObject = initialState, action: ApiUrlActions) => {
  switch (action.type) {
    case ApiUrlActionType.SET_API_URL:
      return (action as SetApiUrlAction).state
    default:
      return state
  }
}
