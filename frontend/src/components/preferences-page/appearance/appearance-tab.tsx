'use client'

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
 * Contains appearance preferences that influence every page of the app.
 */
export const AppearanceTab: React.FC = () => {
  return (
    <ListGroup>
      <SettingLine i18nKey={'appearance.darkMode'}>
        <DarkModeSettingButtonGroup />
      </SettingLine>
      <SettingLine i18nKey={'appearance.language'}>
        <LanguagePicker />
      </SettingLine>
    </ListGroup>
  )
}
