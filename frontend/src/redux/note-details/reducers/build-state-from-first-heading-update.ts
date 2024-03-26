/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteDetails } from '../types'
import { generateNoteTitle } from '@hedgedoc/commons'

/**
 * Builds a {@link NoteDetails} redux state with an updated note title from frontmatter data and the first heading.
 * @param state The previous redux state.
 * @param firstHeading The first heading of the document. Should be {@link undefined} if there is no such heading.
 * @return An updated {@link NoteDetails} redux state.
 */
export const buildStateFromFirstHeadingUpdate = (state: NoteDetails, firstHeading?: string): NoteDetails => {
  return {
    ...state,
    firstHeading: firstHeading,
    title: generateNoteTitle(state.frontmatter, () => firstHeading)
  }
}
