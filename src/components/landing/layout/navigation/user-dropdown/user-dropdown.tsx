import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { ForkAwesomeIcon } from '../../../../../fork-awesome/fork-awesome-icon'
import { ApplicationState } from '../../../../../redux'
import { clearUser } from '../../../../../redux/user/methods'
import { UserAvatar } from '../../user-avatar/user-avatar'

export const UserDropdown: React.FC = () => {
  useTranslation()
  const user = useSelector((state: ApplicationState) => state.user)

  if (!user) {
    return null
  }

  return (
    <Dropdown alignRight>
      <Dropdown.Toggle size="sm" variant="dark" id="dropdown-user" className={'d-flex align-items-center'}>
        <UserAvatar name={user.name} photo={user.photo}/>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <LinkContainer to={'/features'}>
          <Dropdown.Item>
            <ForkAwesomeIcon icon="bolt" fixedWidth={true} className="mr-2"/>
            <Trans i18nKey="editor.help.documents.features"/>
          </Dropdown.Item>
        </LinkContainer>
        <LinkContainer to={'/profile'}>
          <Dropdown.Item>
            <ForkAwesomeIcon icon="user" fixedWidth={true} className="mr-2"/>
            <Trans i18nKey="profile.userProfile"/>
          </Dropdown.Item>
        </LinkContainer>
        <Dropdown.Item
          onClick={() => {
            clearUser()
          }}>
          <ForkAwesomeIcon icon="sign-out" fixedWidth={true} className="mr-2"/>
          <Trans i18nKey="login.signOut"/>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>)
}
