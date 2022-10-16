/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { UserAvatar } from '../../common/user-avatar/user-avatar'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { cypressId } from '../../../utils/cypress-attribute'
import { SignOutDropdownButton } from './sign-out-dropdown-button'
import Link from 'next/link'

/**
 * Renders a dropdown menu with user-relevant actions.
 */
export const UserDropdown: React.FC = () => {
  useTranslation()
  const user = useApplicationState((state) => state.user)

  if (!user) {
    return null
  }

  return (
    <Dropdown align={'end'}>
      <Dropdown.Toggle size='sm' variant='dark' {...cypressId('user-dropdown')} className={'d-flex align-items-center'}>
        <UserAvatar user={user} />
      </Dropdown.Toggle>

      <Dropdown.Menu className='text-start'>
        <Link href={'/n/features'} passHref={true}>
          <Dropdown.Item dir='auto' {...cypressId('user-dropdown-features-button')}>
            <ForkAwesomeIcon icon='bolt' fixedWidth={true} className='mx-2' />
            <Trans i18nKey='editor.help.documents.features' />
          </Dropdown.Item>
        </Link>
        <Link href={'/profile'} passHref={true}>
          <Dropdown.Item dir='auto' {...cypressId('user-dropdown-profile-button')}>
            <ForkAwesomeIcon icon='user' fixedWidth={true} className='mx-2' />
            <Trans i18nKey='profile.userProfile' />
          </Dropdown.Item>
        </Link>
        <SignOutDropdownButton />
      </Dropdown.Menu>
    </Dropdown>
  )
}
