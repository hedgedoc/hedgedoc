/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { ChangeEvent, useEffect, useState } from 'react'
import { Button, Form, FormControl, InputGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { Typeahead } from 'react-bootstrap-typeahead'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../redux'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { ShowIf } from '../../common/show-if/show-if'
import { HistoryEntry } from '../history-page'
import { SortButton, SortModeEnum } from '../sort-button/sort-button'
import { ClearHistoryButton } from './clear-history-button'
import { ExportHistoryButton } from './export-history-button'
import { ImportHistoryButton } from './import-history-button'
import './typeahead-hacks.scss'

export type HistoryToolbarChange = (settings: HistoryToolbarState) => void;

export interface HistoryToolbarState {
  viewState: ViewStateEnum
  titleSortDirection: SortModeEnum
  lastVisitedSortDirection: SortModeEnum
  keywordSearch: string
  selectedTags: string[]
}

export enum ViewStateEnum {
  CARD,
  TABLE
}

export interface HistoryToolbarProps {
  onSettingsChange: HistoryToolbarChange
  tags: string[]
  onClearHistory: () => void
  onRefreshHistory: () => void
  onExportHistory: () => void
  onImportHistory: (entries: HistoryEntry[]) => void
  onUploadAll: () => void
}

export const initState: HistoryToolbarState = {
  viewState: ViewStateEnum.CARD,
  titleSortDirection: SortModeEnum.no,
  lastVisitedSortDirection: SortModeEnum.down,
  keywordSearch: '',
  selectedTags: []
}

export const HistoryToolbar: React.FC<HistoryToolbarProps> = ({ onSettingsChange, tags, onClearHistory, onRefreshHistory, onExportHistory, onImportHistory, onUploadAll }) => {
  const [t] = useTranslation()
  const [state, setState] = useState<HistoryToolbarState>(initState)
  const userExists = useSelector((state: ApplicationState) => !!state.user)

  const titleSortChanged = (direction: SortModeEnum) => {
    setState(prevState => ({
      ...prevState,
      titleSortDirection: direction,
      lastVisitedSortDirection: SortModeEnum.no
    }))
  }

  const lastVisitedSortChanged = (direction: SortModeEnum) => {
    setState(prevState => ({
      ...prevState,
      lastVisitedSortDirection: direction,
      titleSortDirection: SortModeEnum.no
    }))
  }

  const keywordSearchChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setState(prevState => ({ ...prevState, keywordSearch: event.currentTarget.value }))
  }

  const toggleViewChanged = (newViewState: ViewStateEnum) => {
    setState((prevState) => ({ ...prevState, viewState: newViewState }))
  }

  const selectedTagsChanged = (selected: string[]) => {
    setState(prevState => ({ ...prevState, selectedTags: selected }))
  }

  useEffect(() => {
    onSettingsChange(state)
  }, [onSettingsChange, state])

  return (
    <Form inline={true}>
      <InputGroup className={'mr-1 mb-1'}>
        <Typeahead id={'tagsSelection'} options={tags} multiple={true} placeholder={t('landing.history.toolbar.selectTags')}
          onChange={selectedTagsChanged}/>
      </InputGroup>
      <InputGroup className={'mr-1 mb-1'}>
        <FormControl
          placeholder={t('landing.history.toolbar.searchKeywords')}
          aria-label={t('landing.history.toolbar.searchKeywords')}
          onChange={keywordSearchChanged}
        />
      </InputGroup>
      <InputGroup className={'mr-1 mb-1'}>
        <SortButton onDirectionChange={titleSortChanged} direction={state.titleSortDirection} variant={'light'}><Trans
          i18nKey={'landing.history.toolbar.sortByTitle'}/></SortButton>
      </InputGroup>
      <InputGroup className={'mr-1 mb-1'}>
        <SortButton onDirectionChange={lastVisitedSortChanged} direction={state.lastVisitedSortDirection}
          variant={'light'}><Trans i18nKey={'landing.history.toolbar.sortByLastVisited'}/></SortButton>
      </InputGroup>
      <InputGroup className={'mr-1 mb-1'}>
        <ExportHistoryButton onExportHistory={onExportHistory}/>
      </InputGroup>
      <InputGroup className={'mr-1 mb-1'}>
        <ImportHistoryButton onImportHistory={onImportHistory}/>
      </InputGroup>
      <InputGroup className={'mr-1 mb-1'}>
        <ClearHistoryButton onClearHistory={onClearHistory}/>
      </InputGroup>
      <InputGroup className={'mr-1 mb-1'}>
        <Button variant={'light'} title={t('landing.history.toolbar.refresh')} onClick={onRefreshHistory}>
          <ForkAwesomeIcon icon='refresh'/>
        </Button>
      </InputGroup>
      <ShowIf condition={userExists}>
        <InputGroup className={'mr-1 mb-1'}>
          <Button variant={'light'} title={t('landing.history.toolbar.uploadAll')} onClick={onUploadAll}>
            <ForkAwesomeIcon icon='cloud-upload'/>
          </Button>
        </InputGroup>
      </ShowIf>
      <InputGroup className={'mr-1 mb-1'}>
        <ToggleButtonGroup type="radio" name="options" dir='ltr' value={state.viewState} className={'button-height'}
          onChange={(newViewState: ViewStateEnum) => {
            toggleViewChanged(newViewState)
          }}>
          <ToggleButton className={'btn-light'} value={ViewStateEnum.CARD} title={t('landing.history.toolbar.cards')}>
            <ForkAwesomeIcon icon={'sticky-note'} className={'fa-fix-line-height'}/>
          </ToggleButton>
          <ToggleButton className={'btn-light'} value={ViewStateEnum.TABLE} title={t('landing.history.toolbar.table')}>
            <ForkAwesomeIcon icon={'table'} className={'fa-fix-line-height'}/>
          </ToggleButton>
        </ToggleButtonGroup>
      </InputGroup>
    </Form>
  )
}
