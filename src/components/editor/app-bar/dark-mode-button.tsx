/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useIsDarkModeActivated } from '../../../hooks/common/use-is-dark-mode-activated'
import { setDarkMode } from '../../../redux/dark-mode/methods'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'

const DarkModeButton: React.FC = () => {
  const { t } = useTranslation()
  const darkModeEnabled = useIsDarkModeActivated()

  return (
    <ToggleButtonGroup
      type="radio"
      name="dark-mode"
      value={darkModeEnabled}
      className="ml-2"
      onChange={(value: boolean) => {
        setDarkMode(value)
      }}>
      <ToggleButton value={true} variant="outline-secondary" title={t('editor.darkMode.switchToDark')}>
        <ForkAwesomeIcon icon="moon"/>
      </ToggleButton>
      <ToggleButton value={false} variant="outline-secondary" title={t('editor.darkMode.switchToLight')}>
        <ForkAwesomeIcon icon="sun-o"/>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export { DarkModeButton }
