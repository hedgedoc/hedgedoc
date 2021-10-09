/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Reducer } from 'redux'
import { MotdActions, MotdActionType, MotdState, OptionalMotdState } from './types'
import { MOTD_LOCAL_STORAGE_KEY } from '../../components/application-loader/initializers/fetch-motd'

/**
 * A reducer that modifies the {@link OptionalMotdState motd state} in the global application state.
 */
export const MotdReducer: Reducer<OptionalMotdState, MotdActions> = (
  state: OptionalMotdState = null,
  action: MotdActions
) => {
  switch (action.type) {
    case MotdActionType.SET_MOTD:
      return createNewMotdState(action.text, action.lastModified)
    case MotdActionType.DISMISS_MOTD:
      return createDismissedMotdState(state)
    default:
      return state
  }
}

/**
 * Creates a new {@link MotdState motd state} by copying the old state and setting the dismissed flag.
 * It also writes the "last-modified" identifier into the browser's local storage.
 *
 * @param oldState The current motd state that should be copied
 * @return The new state
 */
const createDismissedMotdState = (oldState: OptionalMotdState): OptionalMotdState => {
  if (oldState === null) {
    return null
  } else {
    if (oldState.lastModified) {
      window.localStorage.setItem(MOTD_LOCAL_STORAGE_KEY, oldState.lastModified)
    }
    return {
      ...oldState,
      dismissed: true
    }
  }
}

/**
 * Creates a new not-dismissed motd state.
 * @param text The motd text
 * @param lastModified An identifier that describes when the motd text was changed the last time
 */
const createNewMotdState = (text: string, lastModified: string | null): MotdState => {
  return {
    text,
    lastModified,
    dismissed: false
  }
}
