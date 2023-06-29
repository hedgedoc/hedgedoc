/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { setDarkModePreference } from '../../../../redux/dark-mode/methods'
import { DarkModePreference } from '../../../../redux/dark-mode/types'
import { SettingsToggleButton } from '../utils/settings-toggle-button'
import React, { useCallback } from 'react'
import { ToggleButtonGroup } from 'react-bootstrap'

/**
 * Allows to change if the app should enforce dark mode, light mode or let the browser decide.
 */
const DarkModeSettingButtonGroup: React.FC = () => {
  const darkModePreference = useApplicationState((state) => state.darkMode.darkModePreference)

  const onSelect = useCallback((value: DarkModePreference) => setDarkModePreference(value), [])

  return (
    <ToggleButtonGroup type='radio' name='dark-mode'>
      <SettingsToggleButton
        onSelect={onSelect}
        value={DarkModePreference.DARK}
        selected={darkModePreference === DarkModePreference.DARK}
        i18nKeyLabel={'settings.global.darkMode.dark.label'}
        i18nKeyTooltip={'settings.global.darkMode.dark.tooltip'}
      />
      <SettingsToggleButton
        onSelect={onSelect}
        value={DarkModePreference.LIGHT}
        selected={darkModePreference === DarkModePreference.LIGHT}
        i18nKeyLabel={'settings.global.darkMode.light.label'}
        i18nKeyTooltip={'settings.global.darkMode.light.tooltip'}
      />
      <SettingsToggleButton
        onSelect={onSelect}
        value={DarkModePreference.AUTO}
        selected={darkModePreference === DarkModePreference.AUTO}
        i18nKeyLabel={'settings.global.darkMode.browser.label'}
        i18nKeyTooltip={'settings.global.darkMode.browser.tooltip'}
      />
    </ToggleButtonGroup>
  )
}

export { DarkModeSettingButtonGroup }
