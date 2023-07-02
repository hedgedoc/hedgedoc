/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { SignInButton } from '../../../landing-layout/navigation/sign-in-button'
import { UserDropdown } from '../../../landing-layout/navigation/user-dropdown'
import React from 'react'

/**
 * Renders either the user dropdown or the sign-in button depending on the user state.
 */
export const UserElement: React.FC = () => {
  const userExists = useApplicationState((state) => !!state.user)
  return userExists ? <UserDropdown /> : <SignInButton size={'sm'} className={'h-100'} />
}
