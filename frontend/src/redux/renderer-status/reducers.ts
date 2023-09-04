/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RendererStatus, RendererStatusActions } from './types'
import { RendererStatusActionType } from './types'
import type { Reducer } from 'redux'

export const initialState: RendererStatus = {
  rendererReady: false
}

/**
 * Applies {@link RendererStatusActions renderer status actions} to the global application state.
 *
 * @param state the current state
 * @param action the action that should get applied
 * @return The new changed state
 */
export const RendererStatusReducer: Reducer<RendererStatus, RendererStatusActions> = (
  state: RendererStatus = initialState,
  action: RendererStatusActions
) => {
  switch (action.type) {
    case RendererStatusActionType.SET_RENDERER_STATUS:
      return {
        ...state,
        rendererReady: action.rendererReady
      }
    default:
      return state
  }
}
