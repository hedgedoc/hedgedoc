/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SignInButton } from '../../../landing-layout/navigation/sign-in-button'
import { UserDropdown } from '../../../landing-layout/navigation/user-dropdown'
import React from 'react'
import { useIsLoggedIn } from '../../../../hooks/common/use-is-logged-in'

/**
 * Renders either the user dropdown or the sign-in button depending on the user state.
 */
export const UserElement: React.FC = () => {
  const userExists = useIsLoggedIn()
  return userExists ? <UserDropdown /> : <SignInButton size={'sm'} className={'h-100'} />
}
