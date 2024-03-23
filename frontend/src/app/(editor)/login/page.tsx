'use client'

/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NextPage } from 'next'
import React from 'react'
import { RedirectToParamOrHistory } from '../../../components/login-page/redirect-to-param-or-history'
import { LocalLoginCard } from '../../../components/login-page/local-login/local-login-card'
import { LdapLoginCards } from '../../../components/login-page/ldap/ldap-login-cards'
import { OneClickLoginCard } from '../../../components/login-page/one-click/one-click-login-card'
import { GuestCard } from '../../../components/login-page/guest/guest-card'
import { useIsLoggedIn } from '../../../hooks/common/use-is-logged-in'
import { LoginLayout } from '../../../components/layout/login-layout'

const LoginPage: NextPage = () => {
  const userLoggedIn = useIsLoggedIn()

  if (userLoggedIn) {
    return <RedirectToParamOrHistory />
  }

  return (
    <LoginLayout>
      <GuestCard />
      <LocalLoginCard />
      <LdapLoginCards />
      <OneClickLoginCard />
    </LoginLayout>
  )
}

export default LoginPage
