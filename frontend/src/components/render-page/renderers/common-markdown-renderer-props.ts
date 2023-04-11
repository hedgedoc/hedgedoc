/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface CommonMarkdownRendererProps {
  baseUrl: string
  newLinesAreBreaks?: boolean
  markdownContentLines: string[]
}

export interface HeightChangeRendererProps {
  onHeightChange?: (height: number) => void
}
