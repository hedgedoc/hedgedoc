import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'

const DarkModeButton: React.FC = () => {
  return (
    <ToggleButtonGroup type="checkbox" defaultValue={[]} name="dark-mode" className="ml-2">
      <ToggleButton value={1} variant="light" className="text-secondary">
        <FontAwesomeIcon icon="moon"/>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export { DarkModeButton }
