/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import { PostApiRequestBuilder } from '../common/api-request-builder/post-api-request-builder'
import { PutApiRequestBuilder } from '../common/api-request-builder/put-api-request-builder'
import type { AliasDto, AliasCreateDto, AliasUpdateDto } from '@hedgedoc/commons'

/**
 * Adds an alias to an existing note.
 *
 * @param noteIdOrAlias The note id or an existing alias for a note.
 * @param newAlias The new alias.
 * @return Information about the newly created alias.
 * @throws {Error} when the api request wasn't successful
 */
export const addAlias = async (noteIdOrAlias: string, newAlias: string): Promise<AliasDto> => {
  const response = await new PostApiRequestBuilder<AliasDto, AliasCreateDto>('alias')
    .withJsonBody({
      noteIdOrAlias,
      newAlias
    })
    .sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Marks a given alias as the primary one for a note.
 * The former primary alias should be marked as non-primary by the backend automatically.
 *
 * @param alias The alias to mark as primary for its corresponding note.
 * @return The updated information about the alias.
 * @throws {Error} when the api request wasn't successfull
 */
export const markAliasAsPrimary = async (alias: string): Promise<AliasDto> => {
  const response = await new PutApiRequestBuilder<AliasDto, AliasUpdateDto>('alias/' + alias)
    .withJsonBody({
      primaryAlias: true
    })
    .sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Removes a given alias from its corresponding note.
 *
 * @param alias The alias to remove from its note.
 * @throws {Error} when the api request wasn't successful.
 */
export const deleteAlias = async (alias: string): Promise<void> => {
  await new DeleteApiRequestBuilder('alias/' + alias).sendRequest()
}
