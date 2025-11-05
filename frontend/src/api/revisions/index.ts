/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import type { RevisionInterface, RevisionMetadataInterface } from '@hedgedoc/commons'

/**
 * Retrieves a note revision while using a cache for often retrieved revisions.
 *
 * @param noteId The id of the note for which to fetch the revision.
 * @param revisionId The id of the revision to fetch.
 * @return The revision.
 * @throws {Error} when the api request wasn't successful.
 */
export const getRevision = async (noteId: string, revisionId: string): Promise<RevisionInterface> => {
  const response = await new GetApiRequestBuilder<RevisionInterface>(
    `notes/${noteId}/revisions/${revisionId}`
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
export const getAllRevisions = async (noteId: string): Promise<RevisionMetadataInterface[]> => {
  const response = await new GetApiRequestBuilder<RevisionMetadataInterface[]>(
    `notes/${noteId}/revisions`
  ).sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Deletes all revisions for a note.
 *
 * @param noteAlias The id or alias of the note to delete all revisions for.
 * @throws {Error} when the api request wasn't successful.
 */
export const deleteRevisionsForNote = async (noteAlias: string): Promise<void> => {
  await new DeleteApiRequestBuilder(`notes/${noteAlias}/revisions`).sendRequest()
}
