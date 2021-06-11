/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import equal from 'fast-deep-equal'
import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Form, FormControl, InputGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { Typeahead } from 'react-bootstrap-typeahead'
import { Trans, useTranslation } from 'react-i18next'
import { useQueryState } from 'react-router-use-location-state'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { ShowIf } from '../../common/show-if/show-if'
import { SortButton, SortModeEnum } from '../sort-button/sort-button'
import { ClearHistoryButton } from './clear-history-button'
import { ExportHistoryButton } from './export-history-button'
import { ImportHistoryButton } from './import-history-button'
import './typeahead-hacks.scss'
import { HistoryEntryOrigin } from '../../../redux/history/types'
import { importHistoryEntries, refreshHistoryState, setHistoryEntries } from '../../../redux/history/methods'
import { showErrorNotification } from '../../../redux/ui-notifications/methods'
import { useApplicationState } from '../../../hooks/common/use-application-state'

export type HistoryToolbarChange = (newState: HistoryToolbarState) => void

interface ToolbarSortState {
  titleSortDirection: SortModeEnum
  lastVisitedSortDirection: SortModeEnum
}

interface ToolbarFilterState {
  viewState: ViewStateEnum
  keywordSearch: string
  selectedTags: string[]
}

export type HistoryToolbarState = ToolbarSortState & ToolbarFilterState

export enum ViewStateEnum {
  CARD,
  TABLE
}

export interface HistoryToolbarProps {
  onSettingsChange: HistoryToolbarChange
}

const initSortState: ToolbarSortState = {
  titleSortDirection: SortModeEnum.no,
  lastVisitedSortDirection: SortModeEnum.down
}

export const initToolbarState: HistoryToolbarState = {
  ...initSortState,
  viewState: ViewStateEnum.CARD,
  keywordSearch: '',
  selectedTags: []
}

export const HistoryToolbar: React.FC<HistoryToolbarProps> = ({ onSettingsChange }) => {
  const { t } = useTranslation()
  const historyEntries = useApplicationState((state) => state.history)
  const userExists = useApplicationState((state) => !!state.user)

  const tags = useMemo<string[]>(() => {
    const allTags = historyEntries.map((entry) => entry.tags).flat()
    return [...new Set(allTags)]
  }, [historyEntries])

  const previousState = useRef(initToolbarState)
  const [searchState, setSearchState] = useQueryState('search', initToolbarState.keywordSearch)
  const [tagsState, setTagsState] = useQueryState('tags', initToolbarState.selectedTags)
  const [viewState, setViewState] = useState(initToolbarState.viewState)
  const [sortState, setSortState] = useState<ToolbarSortState>(initSortState)

  const titleSortChanged = useCallback(
    (direction: SortModeEnum) => {
      setSortState({
        lastVisitedSortDirection: SortModeEnum.no,
        titleSortDirection: direction
      })
    },
    [setSortState]
  )

  const lastVisitedSortChanged = useCallback(
    (direction: SortModeEnum) => {
      setSortState({
        lastVisitedSortDirection: direction,
        titleSortDirection: SortModeEnum.no
      })
    },
    [setSortState]
  )

  const keywordSearchChanged = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchState(event.currentTarget.value ?? '')
    },
    [setSearchState]
  )

  const toggleViewChanged = useCallback(
    (newViewState: ViewStateEnum) => {
      setViewState(newViewState)
    },
    [setViewState]
  )

  const selectedTagsChanged = useCallback(
    (selected: string[]) => {
      setTagsState(selected)
    },
    [setTagsState]
  )

  const refreshHistory = useCallback(() => {
    refreshHistoryState().catch(showErrorNotification(t('landing.history.error.getHistory.text')))
  }, [t])

  const onUploadAllToRemote = useCallback(() => {
    if (!userExists) {
      return
    }
    const localEntries = historyEntries
      .filter((entry) => entry.origin === HistoryEntryOrigin.LOCAL)
      .map((entry) => entry.identifier)
    historyEntries.forEach((entry) => (entry.origin = HistoryEntryOrigin.REMOTE))
    importHistoryEntries(historyEntries).catch((error) => {
      showErrorNotification(t('landing.history.error.setHistory.text'))(error)
      historyEntries.forEach((entry) => {
        if (localEntries.includes(entry.identifier)) {
          entry.origin = HistoryEntryOrigin.LOCAL
        }
      })
      setHistoryEntries(historyEntries)
      refreshHistory()
    })
  }, [userExists, historyEntries, t, refreshHistory])

  useEffect(() => {
    const newState: HistoryToolbarState = {
      selectedTags: tagsState,
      keywordSearch: searchState,
      viewState: viewState,
      ...sortState
    }
    // This is needed because the onSettingsChange triggers a state update in history-page which re-renders the toolbar.
    // The re-rendering causes this effect to run again resulting in an infinite state update loop.
    if (equal(previousState.current, newState)) {
      return
    }
    onSettingsChange(newState)
    previousState.current = newState
  }, [onSettingsChange, tagsState, searchState, viewState, sortState])

  return (
    <Form inline={true}>
      <InputGroup className={'mr-1 mb-1'}>
        <Typeahead
          id={'tagsSelection'}
          options={tags}
          multiple={true}
          placeholder={t('landing.history.toolbar.selectTags')}
          onChange={selectedTagsChanged}
          selected={tagsState}
        />
      </InputGroup>
      <InputGroup className={'mr-1 mb-1'}>
        <FormControl
          placeholder={t('landing.history.toolbar.searchKeywords')}
          aria-label={t('landing.history.toolbar.searchKeywords')}
          onChange={keywordSearchChanged}
          value={searchState}
        />
      </InputGroup>
      <InputGroup className={'mr-1 mb-1'}>
        <SortButton onDirectionChange={titleSortChanged} direction={sortState.titleSortDirection} variant={'light'}>
          <Trans i18nKey={'landing.history.toolbar.sortByTitle'} />
        </SortButton>
      </InputGroup>
      <InputGroup className={'mr-1 mb-1'}>
        <SortButton
          onDirectionChange={lastVisitedSortChanged}
          direction={sortState.lastVisitedSortDirection}
          variant={'light'}>
          <Trans i18nKey={'landing.history.toolbar.sortByLastVisited'} />
        </SortButton>
      </InputGroup>
      <InputGroup className={'mr-1 mb-1'}>
        <ExportHistoryButton />
      </InputGroup>
      <InputGroup className={'mr-1 mb-1'}>
        <ImportHistoryButton />
      </InputGroup>
      <InputGroup className={'mr-1 mb-1'}>
        <ClearHistoryButton />
      </InputGroup>
      <InputGroup className={'mr-1 mb-1'}>
        <Button variant={'light'} title={t('landing.history.toolbar.refresh')} onClick={refreshHistory}>
          <ForkAwesomeIcon icon='refresh' />
        </Button>
      </InputGroup>
      <ShowIf condition={userExists}>
        <InputGroup className={'mr-1 mb-1'}>
          <Button variant={'light'} title={t('landing.history.toolbar.uploadAll')} onClick={onUploadAllToRemote}>
            <ForkAwesomeIcon icon='cloud-upload' />
          </Button>
        </InputGroup>
      </ShowIf>
      <InputGroup className={'mr-1 mb-1'}>
        <ToggleButtonGroup
          type='radio'
          name='options'
          dir='ltr'
          value={viewState}
          className={'button-height'}
          onChange={(newViewState: ViewStateEnum) => {
            toggleViewChanged(newViewState)
          }}>
          <ToggleButton className={'btn-light'} value={ViewStateEnum.CARD} title={t('landing.history.toolbar.cards')}>
            <ForkAwesomeIcon icon={'sticky-note'} className={'fa-fix-line-height'} />
          </ToggleButton>
          <ToggleButton className={'btn-light'} value={ViewStateEnum.TABLE} title={t('landing.history.toolbar.table')}>
            <ForkAwesomeIcon icon={'table'} className={'fa-fix-line-height'} />
          </ToggleButton>
        </ToggleButtonGroup>
      </InputGroup>
    </Form>
  )
}
