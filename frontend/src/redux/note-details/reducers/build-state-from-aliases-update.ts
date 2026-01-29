/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteDetails } from '../types'
import type { NoteAliasesInterface } from '@hedgedoc/commons'

/**
 * Builds a {@link NoteDetails} redux state from a note aliases DTO received from the HTTP API.
 * @param state The previous state to update.
 * @param noteAliases The updated aliases from the API.
 * @return An updated {@link NoteDetails} redux state.
 */
export const buildStateFromAliasesUpdate = (state: NoteDetails, noteAliases: NoteAliasesInterface): NoteDetails => {
  return {
    ...state,
    primaryAlias: noteAliases.primaryAlias,
    aliases: noteAliases.aliases
  }
}
