/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SettingLine } from '../utils/setting-line'
import { DarkModeSettingButtonGroup } from './dark-mode-setting-button-group'
import { LanguagePicker } from './language-picker'
import React from 'react'
import { ListGroup } from 'react-bootstrap'

/**
 * Contains global settings that influence every page of the app.
 */
export const GlobalSettingsTabContent: React.FC = () => {
  return (
    <ListGroup>
      <SettingLine i18nKey={'global.darkMode'}>
        <DarkModeSettingButtonGroup />
      </SettingLine>
      <SettingLine i18nKey={'global.language'}>
        <LanguagePicker />
      </SettingLine>
    </ListGroup>
  )
}
