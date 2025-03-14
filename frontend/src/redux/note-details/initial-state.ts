/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteDetails } from './types'
import { defaultNoteFrontmatter } from '@hedgedoc/commons'

export const initialState: NoteDetails = {
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
  createdAt: 0,
  updatedAt: 0,
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
