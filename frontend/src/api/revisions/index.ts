/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import type { RevisionDetails, RevisionMetadata } from './types'

/**
 * Retrieves a note revision while using a cache for often retrieved revisions.
 *
 * @param noteId The id of the note for which to fetch the revision.
 * @param revisionId The id of the revision to fetch.
 * @return The revision.
 * @throws {Error} when the api request wasn't successful.
 */
export const getRevision = async (noteId: string, revisionId: number): Promise<RevisionDetails> => {
  const response = await new GetApiRequestBuilder<RevisionDetails>(
    `notes/${noteId}/revisions/${revisionId}`,
    'revisions'
  ).sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Retrieves a list of all revisions stored for a given note.
 *
 * @param noteId The id of the note for which to look up the stored revisions.
 * @return A list of revision ids.
 * @throws {Error} when the api request wasn't successful.
 */
export const getAllRevisions = async (noteId: string): Promise<RevisionMetadata[]> => {
  const response = await new GetApiRequestBuilder<RevisionMetadata[]>(
    `notes/${noteId}/revisions`,
    'revisions'
  ).sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Deletes all revisions for a note.
 *
 * @param noteIdOrAlias The id or alias of the note to delete all revisions for.
 * @throws {Error} when the api request wasn't successful.
 */
export const deleteRevisionsForNote = async (noteIdOrAlias: string): Promise<void> => {
  await new DeleteApiRequestBuilder(`notes/${noteIdOrAlias}/revisions`, 'revisions').sendRequest()
}
