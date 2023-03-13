/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface LineWithId {
  line: string
  id: number
}

/**
 * Defines the line number of a line marker and its absolute scroll position on the page.
 */
export interface LineMarkerPosition {
  line: number
  position: number
}
