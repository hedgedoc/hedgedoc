/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { store } from '..'
import { DismissMotdAction, MotdActionType, SetMotdAction } from './types'

/**
 * Sets a not-dismissed motd message in the global application state.
 *
 * @param text The motd text content
 * @param lastModified An identifier that describes when the motd was changed the last time.
 */
export const setMotd = (text: string, lastModified: string | null): void => {
  store.dispatch({
    type: MotdActionType.SET_MOTD,
    text,
    lastModified
  } as SetMotdAction)
}

/**
 * Dismisses the currently saved motd message.
 */
export const dismissMotd = (): void => {
  store.dispatch({
    type: MotdActionType.DISMISS_MOTD
  } as DismissMotdAction)
}
