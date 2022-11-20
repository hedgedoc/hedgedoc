/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Action } from 'redux'

export enum RendererStatusActionType {
  SET_RENDERER_STATUS = 'renderer-status/set-ready'
}

export interface RendererStatus {
  rendererReady: boolean
}

export interface SetRendererStatusAction extends Action<RendererStatusActionType> {
  type: RendererStatusActionType.SET_RENDERER_STATUS
  rendererReady: boolean
}

export type RendererStatusActions = SetRendererStatusAction
