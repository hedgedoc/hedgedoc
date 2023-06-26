/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import { cypressId } from '../../../utils/cypress-attribute'
import { UiIcon } from '../../common/icons/ui-icon'
import { ViewStateEnum } from './history-toolbar'
import { useHistoryToolbarState } from './toolbar-context/use-history-toolbar-state'
import React, { useCallback } from 'react'
import { Button, ToggleButtonGroup } from 'react-bootstrap'
import { StickyFill as IconStickyFill, Table as IconTable } from 'react-bootstrap-icons'

/**
 * Toggles the view mode of the history entries between list and card view.
 */
export const HistoryViewModeToggleButton: React.FC = () => {
  const [historyToolbarState, setHistoryToolbarState] = useHistoryToolbarState()

  const onViewStateChange = useCallback(
    (newViewState: ViewStateEnum) => {
      setHistoryToolbarState((state) => ({
        ...state,
        viewState: newViewState
      }))
    },
    [setHistoryToolbarState]
  )

  const cardsButtonTitle = useTranslatedText('landing.history.toolbar.cards')
  const tableButtonTitle = useTranslatedText('landing.history.toolbar.table')

  const onCardsButtonClick = useCallback(() => onViewStateChange(ViewStateEnum.CARD), [onViewStateChange])
  const onTableButtonClick = useCallback(() => onViewStateChange(ViewStateEnum.TABLE), [onViewStateChange])

  return (
    <ToggleButtonGroup type='radio' name='options' dir='auto' className={'button-height'} onChange={onViewStateChange}>
      <Button
        title={cardsButtonTitle}
        variant={historyToolbarState.viewState === ViewStateEnum.CARD ? 'secondary' : 'outline-secondary'}
        onClick={onCardsButtonClick}>
        <UiIcon icon={IconStickyFill} className={'fa-fix-line-height'} />
      </Button>
      <Button
        {...cypressId('history-mode-table')}
        variant={historyToolbarState.viewState === ViewStateEnum.TABLE ? 'secondary' : 'outline-secondary'}
        title={tableButtonTitle}
        onClick={onTableButtonClick}>
        <UiIcon icon={IconTable} className={'fa-fix-line-height'} />
      </Button>
    </ToggleButtonGroup>
  )
}
