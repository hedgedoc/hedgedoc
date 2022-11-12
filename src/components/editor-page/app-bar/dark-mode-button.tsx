/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useIsDarkModeActivated } from '../../../hooks/common/use-is-dark-mode-activated'
import { setDarkMode } from '../../../redux/dark-mode/methods'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'

/**
 * Renders a button group to activate / deactivate the dark mode.
 */
const DarkModeButton: React.FC = () => {
  const { t } = useTranslation()
  const darkModeEnabled = useIsDarkModeActivated()

  const enable = useCallback(() => setDarkMode(true), [])
  const disable = useCallback(() => setDarkMode(false), [])

  return (
    <ButtonGroup className='ms-2'>
      <Button
        onClick={enable}
        variant={darkModeEnabled ? 'secondary' : 'outline-secondary'}
        title={t('editor.darkMode.switchToDark') ?? undefined}>
        <ForkAwesomeIcon icon='moon' />
      </Button>
      <Button
        onClick={disable}
        variant={darkModeEnabled ? 'outline-secondary' : 'secondary'}
        title={t('editor.darkMode.switchToLight') ?? undefined}>
        <ForkAwesomeIcon icon='sun-o' />
      </Button>
    </ButtonGroup>
  )
}

export { DarkModeButton }
