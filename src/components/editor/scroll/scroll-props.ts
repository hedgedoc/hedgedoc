/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface ScrollProps {
  scrollState?: ScrollState
  onScroll?: (scrollState: ScrollState) => void
  onMakeScrollSource?: () => void
}

export interface ScrollState {
  firstLineInView: number
  scrolledPercentage: number
}

export interface DualScrollState {
  editorScrollState: ScrollState
  rendererScrollState: ScrollState
}
