/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { allReducers } from './reducers'
import type { ApplicationState } from './application-state'
import { configureStore } from '@reduxjs/toolkit'
import { isDevMode } from '../utils/test-modes'

export const store = configureStore({
  reducer: allReducers,
  devTools: isDevMode
})

export const getGlobalState = (): ApplicationState => store.getState()
