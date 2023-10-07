/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import { PostApiRequestBuilder } from '../common/api-request-builder/post-api-request-builder'
import type { MediaUpload } from '../media/types'
import type { Note, NoteDeletionOptions, NoteMetadata } from './types'

/**
 * Retrieves the content and metadata about the specified note.
 *
 * @param noteIdOrAlias The id or alias of the note.
 * @return Content and metadata of the specified note.
 * @throws {Error} when the api request wasn't successful.
 */
export const getNote = async (noteIdOrAlias: string, baseUrl?: string): Promise<Note> => {
  const response = await new GetApiRequestBuilder<Note>('notes/' + noteIdOrAlias, baseUrl).sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Retrieves the metadata of the specified note.
 *
 * @param noteIdOrAlias The id or alias of the note.
 * @return Metadata of the specified note.
 */
export const getNoteMetadata = async (noteIdOrAlias: string): Promise<NoteMetadata> => {
  const response = await new GetApiRequestBuilder<NoteMetadata>(`notes/${noteIdOrAlias}/metadata`).sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Returns a list of media objects associated with the specified note.
 *
 * @param noteIdOrAlias The id or alias of the note.
 * @return List of media object metadata associated with specified note.
 * @throws {Error} when the api request wasn't successful.
 */
export const getMediaForNote = async (noteIdOrAlias: string): Promise<MediaUpload[]> => {
  const response = await new GetApiRequestBuilder<MediaUpload[]>(`notes/${noteIdOrAlias}/media`).sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Creates a new note with a given markdown content.
 *
 * @param markdown The content of the new note.
 * @return Content and metadata of the new note.
 * @throws {Error} when the api request wasn't successful.
 */
export const createNote = async (markdown: string): Promise<Note> => {
  const response = await new PostApiRequestBuilder<Note, void>('notes')
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
export const createNoteWithPrimaryAlias = async (markdown: string, primaryAlias: string): Promise<Note> => {
  const response = await new PostApiRequestBuilder<Note, void>('notes/' + primaryAlias)
    .withHeader('Content-Type', 'text/markdown')
    .withBody(markdown)
    .sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Deletes the specified note.
 *
 * @param noteIdOrAlias The id or alias of the note to delete.
 * @throws {Error} when the api request wasn't successful.
 */
export const deleteNote = async (noteIdOrAlias: string): Promise<void> => {
  await new DeleteApiRequestBuilder<void, NoteDeletionOptions>('notes/' + noteIdOrAlias)
    .withJsonBody({
      keepMedia: false
      // TODO Ask whether the user wants to keep the media uploaded to the note.
      //  https://github.com/hedgedoc/hedgedoc/issues/2928
    })
    .sendRequest()
}
