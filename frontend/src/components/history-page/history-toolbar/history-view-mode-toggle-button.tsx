/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../utils/cypress-attribute'
import { UiIcon } from '../../common/icons/ui-icon'
import { ViewStateEnum } from './history-toolbar'
import { useHistoryToolbarState } from './toolbar-context/use-history-toolbar-state'
import React, { useCallback } from 'react'
import { Button, ToggleButtonGroup } from 'react-bootstrap'
import { StickyFill as IconStickyFill } from 'react-bootstrap-icons'
import { Table as IconTable } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

/**
 * Toggles the view mode of the history entries between list and card view.
 */
export const HistoryViewModeToggleButton: React.FC = () => {
  const { t } = useTranslation()
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

  return (
    <ToggleButtonGroup type='radio' name='options' dir='auto' className={'button-height'} onChange={onViewStateChange}>
      <Button
        title={t('landing.history.toolbar.cards') ?? undefined}
        variant={historyToolbarState.viewState === ViewStateEnum.CARD ? 'light' : 'outline-light'}
        onClick={() => onViewStateChange(ViewStateEnum.CARD)}>
        <UiIcon icon={IconStickyFill} className={'fa-fix-line-height'} />
      </Button>
      <Button
        {...cypressId('history-mode-table')}
        variant={historyToolbarState.viewState === ViewStateEnum.TABLE ? 'light' : 'outline-light'}
        title={t('landing.history.toolbar.table') ?? undefined}
        onClick={() => onViewStateChange(ViewStateEnum.TABLE)}>
        <UiIcon icon={IconTable} className={'fa-fix-line-height'} />
      </Button>
    </ToggleButtonGroup>
  )
}
