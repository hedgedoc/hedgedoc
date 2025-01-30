/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

'use client'
/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment } from 'react'
import type { Mode } from '../mode-selection/mode'
import type { NoteType } from '@hedgedoc/commons'
import { FilterByNoteType } from './filters/filter-by-note-type'
import { FilterBySearchTerm } from './filters/filter-by-search-term'
import { useUrlParamState } from '../../../hooks/common/use-url-param-state'
import { SortButton, SortMode } from './filters/sort-button'

export interface ExploreNotesSectionProps {
  mode: Mode
}

export const ExploreNotesSection: React.FC<ExploreNotesSectionProps> = ({ mode }) => {
  const [searchFilter, setSearchFilter] = useUrlParamState<string | null>('search', null)
  const [sortMode, setSortMode] = useUrlParamState<SortMode>('sort', SortMode.LAST_VISITED_DESC)
  const [filterByType, setFilterByType] = useUrlParamState<NoteType | null>('type', null)

  return (
    <Fragment>
      <search className={'d-flex gap-2'}>
        <FilterByNoteType value={filterByType} onChange={setFilterByType} />
        <FilterBySearchTerm value={searchFilter} onChange={setSearchFilter} />
        <SortButton selected={sortMode} onChange={setSortMode} />
      </search>
      <p>Many notes here</p>
    </Fragment>
  )
}
