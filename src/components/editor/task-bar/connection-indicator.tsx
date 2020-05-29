import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { ActiveIndicatorStatus } from './active-indicator'
import './connection-indicator.scss'
import { UserLine } from './user-line'

const ConnectionIndicator: React.FC = () => {
  const userOnline = 2
  return (
    <Dropdown className="small" alignRight>
      <Dropdown.Toggle id="connection-indicator" size="sm" variant="primary" className="upper-case">
        <FontAwesomeIcon icon="users"/> {userOnline} Online
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item disabled={true} className="d-flex align-items-center p-0">
          <UserLine name="Philip Molares" photo="https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=200&r=pg&d=mp" color="red" status={ActiveIndicatorStatus.INACTIVE}/>
        </Dropdown.Item>
        <Dropdown.Item disabled={true} className="d-flex align-items-center p-0">
          <UserLine name="Philip Molares" photo="https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=200&r=pg&d=mp" color="blue" status={ActiveIndicatorStatus.ACTIVE}/>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export { ConnectionIndicator }
