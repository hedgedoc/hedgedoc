/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { doLogout } from '../../../api/auth'
import { clearUser } from '../../../redux/user/methods'
import { cypressId } from '../../../utils/cypress-attribute'
import { UiIcon } from '../../common/icons/ui-icon'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import { useRouter } from 'next/navigation'
import React, { useCallback } from 'react'
import { Dropdown } from 'react-bootstrap'
import { BoxArrowRight as IconBoxArrowRight } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders a sign-out button as a dropdown item for the user-dropdown.
 */
export const SignOutDropdownButton: React.FC = () => {
  useTranslation()
  const { showErrorNotification } = useUiNotifications()
  const router = useRouter()

  const onSignOut = useCallback(() => {
    clearUser()
    doLogout()
      .then((logoutResponse) => router.push(logoutResponse.redirect))
      .catch(showErrorNotification('login.logoutFailed'))
  }, [showErrorNotification, router])

  return (
    <Dropdown.Item dir='auto' onClick={onSignOut} {...cypressId('user-dropdown-sign-out-button')}>
      <UiIcon icon={IconBoxArrowRight} className='mx-2' />
      <Trans i18nKey='login.signOut' />
    </Dropdown.Item>
  )
}
