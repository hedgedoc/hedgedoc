/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { useOutlineButtonVariant } from '../../../hooks/dark-mode/use-outline-button-variant'
import { cypressId } from '../../../utils/cypress-attribute'
import { SignOutDropdownButton } from './sign-out-dropdown-button'
import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { UserAvatar } from '../../common/user-avatar/user-avatar'

/**
 * Renders a dropdown menu with user-relevant actions.
 */
export const UserDropdown: React.FC = () => {
  useTranslation()
  const user = useApplicationState((state) => state.user)
  const buttonVariant = useOutlineButtonVariant()

  if (!user) {
    return null
  }

  return (
    <Dropdown align={'end'}>
      <Dropdown.Toggle
        {...cypressId('user-dropdown')}
        size='sm'
        variant={buttonVariant}
        className={'d-flex align-items-center'}>
        <UserAvatar user={user} />
      </Dropdown.Toggle>

      <Dropdown.Menu className='text-start'>
        <SignOutDropdownButton />
      </Dropdown.Menu>
    </Dropdown>
  )
}
