/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Action } from 'redux'

export enum ApiUrlActionType {
  SET_API_URL = 'api-url/set'
}

export type ApiUrlActions = SetApiUrlAction

export interface SetApiUrlAction extends Action<ApiUrlActionType> {
  type: ApiUrlActionType.SET_API_URL
  state: ApiUrlObject
}

export interface ApiUrlObject {
  apiUrl: string
}
