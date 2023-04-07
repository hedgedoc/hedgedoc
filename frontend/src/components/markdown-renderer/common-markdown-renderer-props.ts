/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Ref } from 'react'

export interface CommonMarkdownRendererProps {
  baseUrl: string
  outerContainerRef?: Ref<HTMLDivElement>
  newlinesAreBreaks?: boolean
  lineOffset?: number
  className?: string
  markdownContentLines: string[]
}
