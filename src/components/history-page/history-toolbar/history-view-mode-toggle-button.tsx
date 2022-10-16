/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react'
import { Button, ToggleButtonGroup } from 'react-bootstrap'
import { cypressId } from '../../../utils/cypress-attribute'
import { ViewStateEnum } from './history-toolbar'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { useHistoryToolbarState } from './toolbar-context/use-history-toolbar-state'

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
        title={t('landing.history.toolbar.cards')}
        variant={historyToolbarState.viewState === ViewStateEnum.CARD ? 'light' : 'outline-light'}
        onClick={() => onViewStateChange(ViewStateEnum.CARD)}>
        <ForkAwesomeIcon icon={'sticky-note'} className={'fa-fix-line-height'} />
      </Button>
      <Button
        {...cypressId('history-mode-table')}
        variant={historyToolbarState.viewState === ViewStateEnum.TABLE ? 'light' : 'outline-light'}
        title={t('landing.history.toolbar.table')}
        onClick={() => onViewStateChange(ViewStateEnum.TABLE)}>
        <ForkAwesomeIcon icon={'table'} className={'fa-fix-line-height'} />
      </Button>
    </ToggleButtonGroup>
  )
}
