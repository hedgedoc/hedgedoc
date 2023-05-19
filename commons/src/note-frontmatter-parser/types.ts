/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Iso6391Language,
  NoteTextDirection,
  NoteType,
  OpenGraph
} from '../note-frontmatter/frontmatter.js'
import { SlideOptions } from '../note-frontmatter/slide-show-options.js'

export interface RawNoteFrontmatter {
  title: string
  description: string
  tags: string | string[]
  robots: string
  lang: Iso6391Language
  dir: NoteTextDirection
  breaks: boolean
  license: string
  type: NoteType
  slideOptions: SlideOptions
  opengraph: OpenGraph
}
