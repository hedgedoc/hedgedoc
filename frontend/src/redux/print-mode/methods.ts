/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '..'
import { printModeActionsCreator } from './slice'

export const setPrintMode = (printMode: boolean): void => {
  const action = printModeActionsCreator.setPrintMode(printMode)
  store.dispatch(action)
}
