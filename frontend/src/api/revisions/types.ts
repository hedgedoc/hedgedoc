/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteEdit } from '../notes/types'

export interface RevisionDetails extends RevisionMetadata {
  content: string
  patch: string
  edits: NoteEdit[]
}

export interface RevisionMetadata {
  id: number
  createdAt: string
  length: number
  authorUsernames: string[]
  anonymousAuthorCount: number
  title: string
  tags: string[]
  description: string
}
