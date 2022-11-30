/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '..'
import type { SetRendererStatusAction } from './types'
import { RendererStatusActionType } from './types'

/**
 * Dispatches a global application state change for the "renderer ready" state.
 *
 * @param rendererReady The new renderer ready state.
 */
export const setRendererStatus = (rendererReady: boolean): void => {
  const action: SetRendererStatusAction = {
    type: RendererStatusActionType.SET_RENDERER_STATUS,
    rendererReady
  }
  store.dispatch(action)
}
