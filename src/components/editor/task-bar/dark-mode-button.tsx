import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

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
          ? <FontAwesomeIcon icon="sun"/>
          : <FontAwesomeIcon icon="moon"/>
        }
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export { DarkModeButton }
