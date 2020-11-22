/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Action } from 'redux'

export enum ApiUrlActionType {
  SET_API_URL = 'api-url/set'
}

export interface ApiUrlActions extends Action<ApiUrlActionType> {
  type: ApiUrlActionType;
}

export interface SetApiUrlAction extends ApiUrlActions {
  state: ApiUrlObject;
}

export interface ApiUrlObject {
  apiUrl: string
}
