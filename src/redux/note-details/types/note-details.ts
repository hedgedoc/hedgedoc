/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { DateTime } from 'luxon'
import type { SlideOptions } from './slide-show-options'
import type { ISO6391 } from './iso6391'

/**
 * Redux state containing the currently loaded note with its content and metadata.
 */
export interface NoteDetails {
  markdownContent: string
  rawFrontmatter: string
  frontmatter: NoteFrontmatter
  frontmatterRendererInfo: RendererFrontmatterInfo
  id: string
  createTime: DateTime
  lastChange: {
    username: string
    timestamp: DateTime
  }
  viewCount: number
  alias: string
  authorship: string[]
  noteTitle: string
  firstHeading?: string
}

export interface NoteFrontmatter {
  title: string
  description: string
  tags: string[]
  deprecatedTagsSyntax: boolean
  robots: string
  lang: typeof ISO6391[number]
  dir: NoteTextDirection
  newlinesAreBreaks: boolean
  GA: string
  disqus: string
  type: NoteType
  opengraph: Map<string, string>
  slideOptions: SlideOptions
}

export enum NoteTextDirection {
  LTR = 'ltr',
  RTL = 'rtl'
}

export enum NoteType {
  DOCUMENT = '',
  SLIDE = 'slide'
}

export interface RendererFrontmatterInfo {
  lineOffset: number
  frontmatterInvalid: boolean
  deprecatedSyntax: boolean
  slideOptions: SlideOptions
}
