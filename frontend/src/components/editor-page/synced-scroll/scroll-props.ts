/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type ScrollCallback = (scrollState: ScrollState) => void

export interface ScrollProps {
  scrollState?: ScrollState | null
  onScroll?: ScrollCallback | null
  onMakeScrollSource?: () => void
}

export interface ScrollState {
  firstLineInView: number
  scrolledPercentage: number
}
