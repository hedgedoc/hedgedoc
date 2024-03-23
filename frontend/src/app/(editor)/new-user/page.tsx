'use client'
/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NextPage } from 'next'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { useIsLoggedIn } from '../../../hooks/common/use-is-logged-in'
import { RedirectToParamOrHistory } from '../../../components/login-page/redirect-to-param-or-history'
import { NewUserCard } from '../../../components/login-page/new-user/new-user-card'
import { LoginLayout } from '../../../components/layout/login-layout'

/**
 * Renders the page where users pick a username when they first log in via SSO.
 */
const NewUserPage: NextPage = () => {
  useTranslation()
  const userLoggedIn = useIsLoggedIn()

  if (userLoggedIn) {
    return <RedirectToParamOrHistory />
  }

  return (
    <LoginLayout>
      <NewUserCard />
    </LoginLayout>
  )
}

export default NewUserPage
