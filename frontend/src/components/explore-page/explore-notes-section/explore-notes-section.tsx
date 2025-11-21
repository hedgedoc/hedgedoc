'use client'
/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment, useEffect, useRef } from 'react'
import { Mode } from '../mode-selection/mode'
import type { NoteType } from '@hedgedoc/commons'
import { FilterByNoteType } from './filters/filter-by-note-type'
import { FilterBySearchTerm } from './filters/filter-by-search-term'
import { useUrlParamState } from '../../../hooks/common/use-url-param-state'
import { SortButton } from './filters/sort-button'
import { NotesList } from './notes-list/notes-list'
import { SortMode } from '@hedgedoc/commons'

export interface ExploreNotesSectionProps {
  mode: Mode
}

export const ExploreNotesSection: React.FC<ExploreNotesSectionProps> = ({ mode }) => {
  const [searchFilter, setSearchFilter] = useUrlParamState<string | null>('search', null)
  const [sortMode, setSortMode] = useUrlParamState<SortMode>(
    'sort',
    mode === Mode.VISITED ? SortMode.LAST_VISITED_DESC : SortMode.UPDATED_AT_DESC
  )
  const [filterByType, setFilterByType] = useUrlParamState<NoteType | null>('type', null)
  const previousMode = useRef<Mode>(mode)

  // Reset filters when mode/page changes
  useEffect(() => {
    if (previousMode.current !== mode) {
      setSearchFilter(null)
      setSortMode(mode === Mode.VISITED ? SortMode.LAST_VISITED_DESC : SortMode.UPDATED_AT_DESC)
      setFilterByType(null)
      previousMode.current = mode
    }
  }, [mode, setFilterByType, setSearchFilter, setSortMode])

  return (
    <Fragment>
      <search className={'d-flex gap-2 mb-2'}>
        <FilterByNoteType value={filterByType} onChange={setFilterByType} />
        <FilterBySearchTerm value={searchFilter} onChange={setSearchFilter} />
        <SortButton selected={sortMode} onChange={setSortMode} showLastVisitedOptions={mode === Mode.VISITED} />
      </search>
      <NotesList mode={mode} sort={sortMode} searchFilter={searchFilter} typeFilter={filterByType} />
    </Fragment>
  )
}
