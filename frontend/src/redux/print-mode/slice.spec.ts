/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { printModeActionsCreator, printModeReducer } from './slice'

describe('printModeReducer', () => {
  it('updates the print mode', () => {
    expect(printModeReducer(false, printModeActionsCreator.setPrintMode(true))).toBe(true)
    expect(printModeReducer(true, printModeActionsCreator.setPrintMode(false))).toBe(false)
  })
})
