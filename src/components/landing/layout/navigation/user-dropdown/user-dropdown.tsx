import { Dropdown } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../../../redux'
import { LinkContainer } from 'react-router-bootstrap'
import { clearUser } from '../../../../../redux/user/methods'
import { Trans, useTranslation } from 'react-i18next'
import { UserAvatar } from '../../user-avatar/user-avatar'

export const UserDropdown: React.FC = () => {
  useTranslation()
  const user = useSelector((state: ApplicationState) => state.user)

  return (
    <Dropdown alignRight>
      <Dropdown.Toggle size="sm" variant="dark" id="dropdown-user" className={'d-flex align-items-center'}>
        <UserAvatar name={user.name} photo={user.photo}/>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <LinkContainer to={'/features'}>
          <Dropdown.Item>
            <FontAwesomeIcon icon="bolt" fixedWidth={true} className="mr-2"/>
            <Trans i18nKey="editor.help.documents.features"/>
          </Dropdown.Item>
        </LinkContainer>
        <LinkContainer to={'/profile'}>
          <Dropdown.Item>
            <FontAwesomeIcon icon="user" fixedWidth={true} className="mr-2"/>
            <Trans i18nKey="profile.userProfile"/>
          </Dropdown.Item>
        </LinkContainer>
        <Dropdown.Item
          onClick={() => {
            clearUser()
          }}>
          <FontAwesomeIcon icon="sign-out-alt" fixedWidth={true} className="mr-2"/>
          <Trans i18nKey="login.signOut"/>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>)
}
