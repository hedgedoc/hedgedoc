/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react'
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
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
    <ToggleButtonGroup
      type='radio'
      name='options'
      dir='auto'
      value={historyToolbarState.viewState}
      className={'button-height'}
      onChange={onViewStateChange}>
      <ToggleButton className={'btn-light'} value={ViewStateEnum.CARD} title={t('landing.history.toolbar.cards')}>
        <ForkAwesomeIcon icon={'sticky-note'} className={'fa-fix-line-height'} />
      </ToggleButton>
      <ToggleButton
        {...cypressId('history-mode-table')}
        className={'btn-light'}
        value={ViewStateEnum.TABLE}
        title={t('landing.history.toolbar.table')}>
        <ForkAwesomeIcon icon={'table'} className={'fa-fix-line-height'} />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
