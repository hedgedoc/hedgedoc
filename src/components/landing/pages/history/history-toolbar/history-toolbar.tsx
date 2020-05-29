import React, { ChangeEvent, useEffect, useState } from 'react'
import { Button, Form, FormControl, InputGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SortButton, SortModeEnum } from '../../../../sort-button/sort-button'
import { Typeahead } from 'react-bootstrap-typeahead'
import './typeahead-hacks.scss'
import { ClearHistoryButton } from './clear-history-button'

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
}

export const initState: HistoryToolbarState = {
  viewState: ViewStateEnum.CARD,
  titleSortDirection: SortModeEnum.no,
  lastVisitedSortDirection: SortModeEnum.no,
  keywordSearch: '',
  selectedTags: []
}

export const HistoryToolbar: React.FC<HistoryToolbarProps> = ({ onSettingsChange, tags, onClearHistory }) => {
  const [t] = useTranslation()
  const [state, setState] = useState<HistoryToolbarState>(initState)

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
      <InputGroup className={'mr-1'}>
        <Typeahead id={'tagsSelection'} options={tags} multiple={true} placeholder={t('selectTags')}
          onChange={selectedTagsChanged}/>
      </InputGroup>
      <InputGroup className={'mr-1'}>
        <FormControl
          placeholder={t('searchKeywords')}
          aria-label={t('searchKeywords')}
          onChange={keywordSearchChanged}
        />
      </InputGroup>
      <InputGroup className={'mr-1'}>
        <SortButton onChange={titleSortChanged} direction={state.titleSortDirection} variant={'light'}><Trans
          i18nKey={'sortByTitle'}/></SortButton>
      </InputGroup>
      <InputGroup className={'mr-1'}>
        <SortButton onChange={lastVisitedSortChanged} direction={state.lastVisitedSortDirection}
          variant={'light'}><Trans i18nKey={'sortByLastVisited'}/></SortButton>
      </InputGroup>
      <InputGroup className={'mr-1'}>
        <Button variant={'light'} title={t('exportHistory')}>
          <FontAwesomeIcon icon={'download'}/>
        </Button>
      </InputGroup>
      <InputGroup className={'mr-1'}>
        <Button variant={'light'} title={t('importHistory')}>
          <FontAwesomeIcon icon={'upload'}/>
        </Button>
      </InputGroup>
      <InputGroup className={'mr-1'}>
        <ClearHistoryButton onClearHistory={onClearHistory}/>
      </InputGroup>
      <InputGroup className={'mr-1'}>
        <Button variant={'light'} title={t('refreshHistory')}>
          <FontAwesomeIcon icon={'sync'}/>
        </Button>
      </InputGroup>
      <InputGroup className={'mr-1'}>
        <ToggleButtonGroup type="radio" name="options" value={state.viewState}
          onChange={(newViewState: ViewStateEnum) => {
            toggleViewChanged(newViewState)
          }}>
          <ToggleButton className={'btn-light'} value={ViewStateEnum.CARD}><Trans
            i18nKey={'cards'}/></ToggleButton>
          <ToggleButton className={'btn-light'} value={ViewStateEnum.TABLE}><Trans
            i18nKey={'table'}/></ToggleButton>
        </ToggleButtonGroup>
      </InputGroup>
    </Form>
  )
}
