'use client'

/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons'
import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { AccountUsername } from './account-username'
import { AccountActionsSection } from './account-actions-section'
import { ChangePasswordSection } from './change-password-section'
import { NotLoggedInMessage } from '../not-logged-in-message'

/**
 * Shows account and authentication preferences.
 */
export const AccountTab: React.FC = () => {
  useTranslation()
  const authProvider = useApplicationState((state) => state.user?.authProvider)

  if (!authProvider || authProvider === AuthProviderType.GUEST) {
    return <NotLoggedInMessage />
  }

  return (
    <Fragment>
      <AccountUsername />
      <hr className={'my-4'} />
      <ChangePasswordSection />
      <hr className={'my-4'} />
      {/* TODO Add options for linking/unlinking other auth identities here */}
      <AccountActionsSection />
    </Fragment>
  )
}
