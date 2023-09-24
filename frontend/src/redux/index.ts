/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isDevMode } from '@hedgedoc/commons'
import type { ApplicationState } from './application-state'
import { allReducers } from './reducers'
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: allReducers,
  devTools: isDevMode
})

export const getGlobalState = (): ApplicationState => store.getState()
