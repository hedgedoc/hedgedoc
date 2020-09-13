import React from 'react'
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../redux'
import { setDarkMode } from '../../../redux/dark-mode/methods'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'

const DarkModeButton: React.FC = () => {
  const { t } = useTranslation()
  const darkModeEnabled = useSelector((state: ApplicationState) => state.darkMode.darkMode)

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
