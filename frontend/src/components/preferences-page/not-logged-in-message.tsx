/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { SignInButton } from '../landing-layout/navigation/sign-in-button'

/**
 * Renders the not logged in message for tabs where authentication is required but not present
 */
export const NotLoggedInMessage: React.FC = () => {
  useTranslation()

  return (
    <div className={'text-center'}>
      <p>
        <Trans i18nKey={'preferences.notLoggedIn'} />
      </p>
      <SignInButton className={'mt-2'} />
    </div>
  )
}
