/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useIsDarkModeActivated } from '../../../hooks/common/use-is-dark-mode-activated'
import { setDarkMode } from '../../../redux/dark-mode/methods'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'

enum DarkModeState {
  DARK,
  LIGHT
}

const DarkModeButton: React.FC = () => {
  const { t } = useTranslation()
  const darkModeEnabled = useIsDarkModeActivated() ? DarkModeState.DARK : DarkModeState.LIGHT

  return (
    <ToggleButtonGroup
      type="radio"
      name="dark-mode"
      value={darkModeEnabled}
      className="ml-2"
    >
      <ToggleButton
        value={DarkModeState.DARK}
        variant="outline-secondary"
        title={t('editor.darkMode.switchToDark')}
        onChange={() => setDarkMode(true)}
      >
        <ForkAwesomeIcon icon="moon"/>
      </ToggleButton>
      <ToggleButton
        value={DarkModeState.LIGHT}
        variant="outline-secondary"
        title={t('editor.darkMode.switchToLight')}
        onChange={() => setDarkMode(false)}
      >
        <ForkAwesomeIcon icon="sun-o"/>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export { DarkModeButton }
