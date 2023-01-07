/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteMetadata } from '../../../api/notes/types'
import type { CursorSelection } from '../../../components/editor-page/editor-pane/tool-bar/formatters/types/cursor-selection'
import type { ISO6391 } from './iso6391'
import type { SlideOptions } from './slide-show-options'

type UnnecessaryNoteAttributes = 'updatedAt' | 'createdAt' | 'tags' | 'description'

/**
 * Redux state containing the currently loaded note with its content and metadata.
 */
export interface NoteDetails extends Omit<NoteMetadata, UnnecessaryNoteAttributes> {
  updatedAt: number
  createdAt: number
  markdownContent: {
    plain: string
    lines: string[]
    lineStartIndexes: number[]
  }
  selection: CursorSelection
  firstHeading?: string
  rawFrontmatter: string
  frontmatter: NoteFrontmatter
  frontmatterRendererInfo: RendererFrontmatterInfo
}

export type Iso6391Language = (typeof ISO6391)[number]

export type OpenGraph = Record<string, string>

export interface NoteFrontmatter {
  title: string
  description: string
  tags: string[]
  robots: string
  lang: Iso6391Language
  dir: NoteTextDirection
  newlinesAreBreaks: boolean
  GA: string
  disqus: string
  type: NoteType
  opengraph: OpenGraph
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
  slideOptions: SlideOptions
}
