/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ISO6391 } from './iso6391.js'
import { SlideOptions } from './slide-show-options.js'

export type Iso6391Language = (typeof ISO6391)[number]

export type OpenGraph = Record<string, string>

export enum NoteTextDirection {
  LTR = 'ltr',
  RTL = 'rtl',
}

export enum NoteType {
  DOCUMENT = 'document',
  SLIDE = 'slide',
}
export interface NoteFrontmatter {
  title: string
  description: string
  tags: string[]
  robots: string
  lang: Iso6391Language
  dir: NoteTextDirection
  newlinesAreBreaks: boolean
  license: string
  type: NoteType
  opengraph: OpenGraph
  slideOptions: SlideOptions
}
