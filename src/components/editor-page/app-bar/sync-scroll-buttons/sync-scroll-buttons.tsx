/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { setEditorSyncScroll } from '../../../../redux/editor/methods'
import DisabledScroll from './disabledScroll.svg'
import EnabledScroll from './enabledScroll.svg'
import './sync-scroll-buttons.module.scss'
import { useApplicationState } from '../../../../hooks/common/use-application-state'

/**
 * Renders a button group with two states for the sync scroll buttons.
 * This makes it possible to activate or deactivate sync scrolling.
 */
export const SyncScrollButtons: React.FC = () => {
  const syncScrollEnabled = useApplicationState((state) => state.editorConfig.syncScroll)
  const { t } = useTranslation()
  const enable = useCallback(() => setEditorSyncScroll(true), [])
  const disable = useCallback(() => setEditorSyncScroll(false), [])

  return (
    <ButtonGroup className='ms-2 ms-2 sync-scroll-buttons'>
      <Button
        onClick={enable}
        variant={syncScrollEnabled ? 'secondary' : 'outline-secondary'}
        title={t('editor.appBar.syncScroll.enable')}>
        <EnabledScroll />
      </Button>
      <Button
        onClick={disable}
        variant={syncScrollEnabled ? 'outline-secondary' : 'secondary'}
        title={t('editor.appBar.syncScroll.disable')}>
        <DisabledScroll />
      </Button>
    </ButtonGroup>
  )
}
