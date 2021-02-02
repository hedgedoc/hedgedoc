/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface LineKeys {
  line: string,
  id: number
}

export interface LineMarkerPosition {
  line: number
  position: number
}

export interface AdditionalMarkdownRendererProps {
  className?: string,
  content: string
}
