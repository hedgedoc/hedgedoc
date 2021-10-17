/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Action } from 'redux'

export enum MotdActionType {
  SET_MOTD = 'motd/set',
  DISMISS_MOTD = 'motd/dismiss'
}

export type MotdActions = SetMotdAction | DismissMotdAction

export interface SetMotdAction extends Action<MotdActionType> {
  type: MotdActionType.SET_MOTD
  text: string
  lastModified: string | null
}

export interface DismissMotdAction extends Action<MotdActionType> {
  type: MotdActionType.DISMISS_MOTD
}

export interface MotdState {
  text: string
  lastModified: string | null
  dismissed: boolean
}

export type OptionalMotdState = MotdState | null
