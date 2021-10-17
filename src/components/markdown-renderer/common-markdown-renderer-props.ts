/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { TocAst } from 'markdown-it-toc-done-right'
import type { ImageClickHandler } from './replace-components/image/image-replacer'
import type { Ref } from 'react'

export interface CommonMarkdownRendererProps {
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
  onTaskCheckedChange?: (lineInMarkdown: number, checked: boolean) => void
  onTocChange?: (ast?: TocAst) => void
  baseUrl?: string
  onImageClick?: ImageClickHandler
  outerContainerRef?: Ref<HTMLDivElement>
  useAlternativeBreaks?: boolean
  lineOffset?: number
  className?: string
  content: string
}
