/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { buildStateFromAddUser } from './reducers/build-state-from-add-user'
import { buildStateFromRemoveUser } from './reducers/build-state-from-remove-user'
import type { RealtimeActions, RealtimeState } from './types'
import { RealtimeActionType } from './types'
import type { Reducer } from 'redux'

const initialState: RealtimeState = {
  users: []
}

/**
 * Applies {@link RealtimeReducer realtime actions} to the global application state.
 *
 * @param state the current state
 * @param action the action that should get applied
 * @return The new changed state
 */
export const RealtimeReducer: Reducer<RealtimeState, RealtimeActions> = (
  state = initialState,
  action: RealtimeActions
) => {
  switch (action.type) {
    case RealtimeActionType.ADD_ONLINE_USER:
      return buildStateFromAddUser(state, action.clientId, action.user)
    case RealtimeActionType.REMOVE_ONLINE_USER:
      return buildStateFromRemoveUser(state, action.clientId)
    default:
      return state
  }
}
