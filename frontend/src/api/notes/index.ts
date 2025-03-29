/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import { PostApiRequestBuilder } from '../common/api-request-builder/post-api-request-builder'
import type { MediaUploadDto, NoteDto, NoteMetadataDto } from '@hedgedoc/commons'
import type { NoteMediaDeletionDto } from '@hedgedoc/commons/dist/esm'

/**
 * Retrieves the content and metadata about the specified note.
 *
 * @param noteIdOrAlias The id or alias of the note.
 * @return Content and metadata of the specified note.
 * @throws {Error} when the api request wasn't successful.
 */
export const getNote = async (noteIdOrAlias: string, baseUrl?: string): Promise<NoteDto> => {
  const response = await new GetApiRequestBuilder<NoteDto>('notes/' + noteIdOrAlias, baseUrl).sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Retrieves the metadata of the specified note.
 *
 * @param noteIdOrAlias The id or alias of the note.
 * @return Metadata of the specified note.
 */
export const getNoteMetadata = async (noteIdOrAlias: string): Promise<NoteMetadataDto> => {
  const response = await new GetApiRequestBuilder<NoteMetadataDto>(`notes/${noteIdOrAlias}/metadata`).sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Returns a list of media objects associated with the specified note.
 *
 * @param noteIdOrAlias The id or alias of the note.
 * @return List of media object metadata associated with specified note.
 * @throws {Error} when the api request wasn't successful.
 */
export const getMediaForNote = async (noteIdOrAlias: string): Promise<MediaUploadDto[]> => {
  const response = await new GetApiRequestBuilder<MediaUploadDto[]>(`notes/${noteIdOrAlias}/media`).sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Creates a new note with a given markdown content.
 *
 * @param markdown The content of the new note.
 * @return Content and metadata of the new note.
 * @throws {Error} when the api request wasn't successful.
 */
export const createNote = async (markdown: string): Promise<NoteDto> => {
  const response = await new PostApiRequestBuilder<NoteDto, void>('notes')
    .withHeader('Content-Type', 'text/markdown')
    .withBody(markdown)
    .sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Creates a new note with a given markdown content and a defined primary alias.
 *
 * @param markdown The content of the new note.
 * @param primaryAlias The primary alias of the new note.
 * @return Content and metadata of the new note.
 * @throws {Error} when the api request wasn't successful.
 */
export const createNoteWithPrimaryAlias = async (markdown: string, primaryAlias: string): Promise<NoteDto> => {
  const response = await new PostApiRequestBuilder<NoteDto, void>('notes/' + primaryAlias)
    .withHeader('Content-Type', 'text/markdown')
    .withBody(markdown)
    .sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Deletes the specified note.
 *
 * @param noteIdOrAlias The id or alias of the note to delete.
 * @param keepMedia Whether to keep the uploaded media associated with the note.
 * @throws {Error} when the api request wasn't successful.
 */
export const deleteNote = async (noteIdOrAlias: string, keepMedia: boolean): Promise<void> => {
  await new DeleteApiRequestBuilder<void, NoteMediaDeletionDto>('notes/' + noteIdOrAlias)
    .withJsonBody({
      keepMedia
    })
    .sendRequest()
}
