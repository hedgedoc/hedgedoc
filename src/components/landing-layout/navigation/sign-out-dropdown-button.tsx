/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react'
import { clearUser } from '../../../redux/user/methods'
import { cypressId } from '../../../utils/cypress-attribute'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { Trans, useTranslation } from 'react-i18next'
import { Dropdown } from 'react-bootstrap'
import { doLogout } from '../../../api/auth'
import { showErrorNotification } from '../../../redux/ui-notifications/methods'

/**
 * Renders a sign-out button as a dropdown item for the user-dropdown.
 */
export const SignOutDropdownButton: React.FC = () => {
  useTranslation()

  const onSignOut = useCallback(() => {
    clearUser()
    doLogout().catch(showErrorNotification('login.logoutFailed'))
  }, [])

  return (
    <Dropdown.Item dir='auto' onClick={onSignOut} {...cypressId('user-dropdown-sign-out-button')}>
      <ForkAwesomeIcon icon='sign-out' fixedWidth={true} className='mx-2' />
      <Trans i18nKey='login.signOut' />
    </Dropdown.Item>
  )
}
