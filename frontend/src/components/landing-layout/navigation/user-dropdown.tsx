/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { cypressId } from '../../../utils/cypress-attribute'
import { UiIcon } from '../../common/icons/ui-icon'
import { UserAvatarForUser } from '../../common/user-avatar/user-avatar-for-user'
import { SignOutDropdownButton } from './sign-out-dropdown-button'
import Link from 'next/link'
import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { Person as IconPerson } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

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
        <UserAvatarForUser user={user} />
      </Dropdown.Toggle>

      <Dropdown.Menu className='text-start'>
        <Link href={'/profile'} passHref={true} legacyBehavior={true}>
          <Dropdown.Item dir='auto' {...cypressId('user-dropdown-profile-button')}>
            <UiIcon icon={IconPerson} className='mx-2' />
            <Trans i18nKey='profile.userProfile' />
          </Dropdown.Item>
        </Link>
        <SignOutDropdownButton />
      </Dropdown.Menu>
    </Dropdown>
  )
}
