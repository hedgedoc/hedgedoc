/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteMetadata } from '../../api/notes/types'
import type { CursorSelection } from '../../components/editor-page/editor-pane/tool-bar/formatters/types/cursor-selection'
import type { NoteFrontmatter } from '@hedgedoc/commons'

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
  startOfContentLineOffset: number
}
