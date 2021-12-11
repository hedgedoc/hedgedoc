/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { LinkContainer } from 'react-router-bootstrap'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { UserAvatar } from '../../common/user-avatar/user-avatar'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { cypressId } from '../../../utils/cypress-attribute'
import { SignOutDropdownButton } from './sign-out-dropdown-button'

export const UserDropdown: React.FC = () => {
  useTranslation()
  const user = useApplicationState((state) => state.user)

  if (!user) {
    return null
  }

  return (
    <Dropdown alignRight>
      <Dropdown.Toggle size='sm' variant='dark' {...cypressId('user-dropdown')} className={'d-flex align-items-center'}>
        <UserAvatar name={user.displayName} photo={user.photo} />
      </Dropdown.Toggle>

      <Dropdown.Menu className='text-start'>
        <LinkContainer to={'/n/features'}>
          <Dropdown.Item dir='auto' {...cypressId('user-dropdown-features-button')}>
            <ForkAwesomeIcon icon='bolt' fixedWidth={true} className='mx-2' />
            <Trans i18nKey='editor.help.documents.features' />
          </Dropdown.Item>
        </LinkContainer>
        <LinkContainer to={'/profile'}>
          <Dropdown.Item dir='auto' {...cypressId('user-dropdown-profile-button')}>
            <ForkAwesomeIcon icon='user' fixedWidth={true} className='mx-2' />
            <Trans i18nKey='profile.userProfile' />
          </Dropdown.Item>
        </LinkContainer>
        <SignOutDropdownButton />
      </Dropdown.Menu>
    </Dropdown>
  )
}
