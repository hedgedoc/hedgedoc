/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import equal from 'fast-deep-equal'
import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { ApplicationState } from '../../../redux'
import { clearUser } from '../../../redux/user/methods'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { UserAvatar } from '../../common/user-avatar/user-avatar'

export const UserDropdown: React.FC = () => {
  useTranslation()
  const user = useSelector((state: ApplicationState) => state.user, equal)

  if (!user) {
    return null
  }

  return (
    <Dropdown alignRight>
      <Dropdown.Toggle size="sm" variant="dark" id="dropdown-user" className={'d-flex align-items-center'}>
        <UserAvatar name={user.name} photo={user.photo}/>
      </Dropdown.Toggle>

      <Dropdown.Menu className='text-start'>
        <LinkContainer to={'/n/features'}>
          <Dropdown.Item dir='auto'>
            <ForkAwesomeIcon icon="bolt" fixedWidth={true} className="mx-2"/>
            <Trans i18nKey="editor.help.documents.features"/>
          </Dropdown.Item>
        </LinkContainer>
        <LinkContainer to={'/profile'}>
          <Dropdown.Item dir='auto'>
            <ForkAwesomeIcon icon="user" fixedWidth={true} className="mx-2"/>
            <Trans i18nKey="profile.userProfile"/>
          </Dropdown.Item>
        </LinkContainer>
        <Dropdown.Item dir='auto'
          onClick={() => {
            clearUser()
          }}>
          <ForkAwesomeIcon icon="sign-out" fixedWidth={true} className="mx-2"/>
          <Trans i18nKey="login.signOut"/>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>)
}
