/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SettingLine } from '../utils/setting-line'
import { LigatureSettingButtonGroup } from './ligature-setting-button-group'
import { LineWrappingSettingButtonGroup } from './line-wrapping-setting-button-group'
import { SmartPasteSettingButtonGroup } from './smart-paste-setting-button-group'
import { SyncScrollSettingButtonGroup } from './sync-scroll-setting-button-group'
import React from 'react'
import { ListGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

/**
 * Shows the editor specific settings.
 */
export const EditorSettingsTabContent: React.FC = () => {
  useTranslation()

  return (
    <ListGroup>
      <SettingLine i18nKey={'editor.ligatures'}>
        <LigatureSettingButtonGroup />
      </SettingLine>
      <SettingLine i18nKey={'editor.smartPaste'}>
        <SmartPasteSettingButtonGroup />
      </SettingLine>
      <SettingLine i18nKey={'editor.syncScroll'}>
        <SyncScrollSettingButtonGroup />
      </SettingLine>
      <SettingLine i18nKey={'editor.lineWrapping'}>
        <LineWrappingSettingButtonGroup />
      </SettingLine>
    </ListGroup>
  )
}
