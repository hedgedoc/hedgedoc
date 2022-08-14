/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Note, NoteDeletionOptions } from './types'
import type { MediaUpload } from '../media/types'
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import { PostApiRequestBuilder } from '../common/api-request-builder/post-api-request-builder'
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'

/**
 * Retrieves the content and metadata about the specified note.
 *
 * @param noteIdOrAlias The id or alias of the note.
 * @return Content and metadata of the specified note.
 * @throws {Error} when the api request wasn't successful.
 */
export const getNote = async (noteIdOrAlias: string): Promise<Note> => {
  const response = await new GetApiRequestBuilder<Note>('notes/' + noteIdOrAlias)
    .withStatusCodeErrorMapping({ 404: 'api.note.notFound', 403: 'api.note.forbidden' })
    .sendRequest()
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
      // https://github.com/hedgedoc/react-client/issues/2288
    })
    .sendRequest()
}
