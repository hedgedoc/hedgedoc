/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { DarkModeSettingButtonGroup } from './dark-mode-setting-button-group'
import { ListGroup } from 'react-bootstrap'
import { LanguagePicker } from './language-picker'
import { SettingLine } from '../utils/setting-line'

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
