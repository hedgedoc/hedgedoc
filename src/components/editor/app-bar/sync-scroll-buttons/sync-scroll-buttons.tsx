/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../../redux'
import { setEditorSyncScroll } from '../../../../redux/editor/methods'
import { ReactComponent as DisabledScrollIcon } from './disabledScroll.svg'
import { ReactComponent as EnabledScrollIcon } from './enabledScroll.svg'
import './sync-scroll-buttons.scss'

export const SyncScrollButtons: React.FC = () => {
  const syncScroll: boolean = useSelector((state: ApplicationState) => state.editorConfig.syncScroll)
  const { t } = useTranslation()

  return (
    <ToggleButtonGroup type="radio" defaultValue={[]} name="sync-scroll" className={'ml-2 sync-scroll-buttons'}
      value={[syncScroll]}>
      <ToggleButton
        variant={'outline-secondary'}
        title={t('editor.appBar.syncScroll.enable')}
        onChange={() => setEditorSyncScroll(true)} value={true}
      >
        <EnabledScrollIcon/>
      </ToggleButton>
      <ToggleButton
        variant={'outline-secondary'}
        title={t('editor.appBar.syncScroll.disable')}
        onChange={() => setEditorSyncScroll(false)} value={false}
      >
        <DisabledScrollIcon/>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
