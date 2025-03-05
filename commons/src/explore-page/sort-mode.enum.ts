/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export enum SortMode {
  TITLE_ASC = 'title_asc',
  TITLE_DESC = 'title_desc',
  UPDATED_AT_ASC = 'updated_at_asc',
  UPDATED_AT_DESC = 'updated_at_desc',
}

export type OptionalSortMode = SortMode | ''
