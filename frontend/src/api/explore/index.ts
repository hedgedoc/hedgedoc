/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import { type NoteExploreEntryInterface, type NoteType, SortMode } from '@hedgedoc/commons'
import { createURLSearchParams } from './utils'
import { Mode } from '../../components/explore-page/mode-selection/mode'

/**
 * Fetches the pinned notes of a user
 *
 * @return A list of pinned notes.
 * @throws {Error} when the api request wasn't successful.
 */
export const getPinnedNotes = async (): Promise<NoteExploreEntryInterface[]> => {
  const response = await new GetApiRequestBuilder<NoteExploreEntryInterface[]>('explore/pinned').sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Fetches the note entries for the selected mode of the explore page
 *
 * @return The list of notes to show on the explore page.
 * @throws {Error} when the api request wasn't successful.
 */
export const getExplorePageEntries = async (
  mode: Mode,
  sort: SortMode,
  searchFilter: string | null,
  typeFilter: NoteType | null,
  page: number
): Promise<NoteExploreEntryInterface[]> => {
  if (mode !== Mode.VISITED && (sort === SortMode.LAST_VISITED_DESC || sort === SortMode.LAST_VISITED_ASC)) {
    throw new Error('Invalid sort mode for the selected explore mode')
  }
  const params = createURLSearchParams(sort, searchFilter, typeFilter, page)
  const response = await new GetApiRequestBuilder<NoteExploreEntryInterface[]>(
    `explore/${mode}?${params}`
  ).sendRequest()
  return response.asParsedJsonObject()
}
