import React, { useState } from 'react'
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../fork-awesome/fork-awesome-icon'

const DarkModeButton: React.FC = () => {
  const { t } = useTranslation()
  const [buttonState, setButtonState] = useState(false)
  const buttonToggle = () => {
    setButtonState(prevState => !prevState)
  }

  return (
    <ToggleButtonGroup type="checkbox" defaultValue={[]} name="dark-mode" className="ml-2" value={buttonState ? ['dark'] : ['']}>
      <ToggleButton
        title={ buttonState ? t('editor.darkMode.switchToLight') : t('editor.darkMode.switchToDark')}
        variant={ buttonState ? 'secondary' : 'light' }
        className={ buttonState ? 'text-white' : 'text-secondary' }
        onChange={buttonToggle} value={'dark'}
      >
        {buttonState
          ? <ForkAwesomeIcon icon="sun"/>
          : <ForkAwesomeIcon icon="moon"/>
        }
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export { DarkModeButton }
