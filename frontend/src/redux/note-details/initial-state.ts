/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteDetails } from './types'
import { defaultNoteFrontmatter } from '@hedgedoc/commons'

export const initialState: NoteDetails = {
  id: '',
  lastUpdatedBy: null,
  version: 0,
  markdownContent: {
    plain: '',
    lines: [],
    lineStartIndexes: []
  },
  selection: { from: 0 },
  rawFrontmatter: '',
  startOfContentLineOffset: 0,
  createdAt: '1970-01-01T00:00:00.000Z',
  updatedAt: '1970-01-01T00:00:00.000Z',
  aliases: [],
  primaryAlias: '',
  permissions: {
    owner: null,
    sharedToGroups: [],
    sharedToUsers: []
  },
  editedBy: [],
  title: '',
  firstHeading: '',
  frontmatter: defaultNoteFrontmatter
}
