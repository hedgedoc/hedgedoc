/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteDetails } from '../types'
import { DateTime } from 'luxon'
import type { NoteMetadataDto } from '@hedgedoc/commons'

/**
 * Builds a {@link NoteDetails} redux state from a note metadata DTO received from the HTTP API.
 * @param state The previous state to update.
 * @param noteMetadata The updated metadata from the API.
 * @return An updated {@link NoteDetails} redux state.
 */
export const buildStateFromMetadataUpdate = (state: NoteDetails, noteMetadata: NoteMetadataDto): NoteDetails => {
  return {
    ...state,
    updateUsername: noteMetadata.updateUsername,
    permissions: noteMetadata.permissions,
    editedBy: noteMetadata.editedBy,
    primaryAddress: noteMetadata.primaryAddress,
    id: noteMetadata.id,
    aliases: noteMetadata.aliases,
    title: noteMetadata.title,
    version: noteMetadata.version,
    viewCount: noteMetadata.viewCount,
    createdAt: DateTime.fromISO(noteMetadata.createdAt).toSeconds(),
    updatedAt: DateTime.fromISO(noteMetadata.updatedAt).toSeconds()
  }
}
