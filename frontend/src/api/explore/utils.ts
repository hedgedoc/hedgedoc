/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteType, SortMode } from '@hedgedoc/commons'

/**
 * Create the necessary url parameters for the api calls of the explore page.
 * @param sort Ask the backend to sort by this field
 * @param searchFilter Ask the backend to filter by this string in title and tags
 * @param typeFilter Ask the backend to filter by this type
 * @param page Ask the backend to return this page of results
 * @return a string representation of the search parameters
 */
export const createURLSearchParams = (
  sort: SortMode,
  searchFilter: string | null,
  typeFilter: NoteType | null,
  page: number
): string => {
  const params = new URLSearchParams()
  params.set('sort', sort)
  params.set('page', page.toString())
  if (searchFilter) {
    params.set('search', searchFilter)
  }
  if (typeFilter) {
    params.set('type', typeFilter)
  }
  return params.toString()
}
