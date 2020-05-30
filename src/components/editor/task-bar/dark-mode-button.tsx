import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'

const DarkModeButton: React.FC = () => {
  const [buttonState, setButtonState] = useState(false)
  const buttonToggle = () => {
    setButtonState(prevState => !prevState)
  }

  return (
    <ToggleButtonGroup type="checkbox" defaultValue={[]} name="dark-mode" className="ml-2" value={buttonState ? ['dark'] : ['']}>
      <ToggleButton variant={ buttonState ? 'secondary' : 'light' } className={ buttonState ? 'text-white' : 'text-secondary' } onChange={buttonToggle} value={'dark'}>
        <FontAwesomeIcon icon="moon"/>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export { DarkModeButton }
