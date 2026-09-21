'use client'

/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NextPage } from 'next'
import React from 'react'
import { RedirectToParamOrExplore } from '../../../components/login-page/redirect-to-param-or-explore'
import { LocalLoginCard } from '../../../components/login-page/local-login/local-login-card'
import { LdapLoginCards } from '../../../components/login-page/ldap/ldap-login-cards'
import { OneClickLoginCard } from '../../../components/login-page/one-click/one-click-login-card'
import { GuestCard } from '../../../components/login-page/guest/guest-card'
import { useIsLoggedIn } from '../../../hooks/common/use-is-logged-in'
import { TwoColumnLayout } from '../../../components/layout/two-column-layout'
import { OidcLoginErrorCard } from '../../../components/login-page/oidc/oidc-login-error-card'
import { HedgeDocLogoVertical } from '../../../components/common/hedge-doc-logo/hedge-doc-logo-vertical'
import { LogoSize } from '../../../components/common/hedge-doc-logo/logo-size'
import { CustomBranding } from '../../../components/common/custom-branding/custom-branding'
import { IntroCustomContent } from '../../../components/intro-page/intro-custom-content'
import { EditorToRendererCommunicatorContextProvider } from '../../../components/editor-page/render-context/editor-to-renderer-communicator-context-provider'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders the login page with different login methods.
 */
const LoginPage: NextPage = () => {
  useTranslation()
  const userLoggedIn = useIsLoggedIn()

  if (userLoggedIn) {
    return <RedirectToParamOrExplore />
  }

  return (
    <TwoColumnLayout
      leftSide={
        <EditorToRendererCommunicatorContextProvider>
          <div className={'d-flex flex-column align-items-center mt-3'}>
            <HedgeDocLogoVertical size={LogoSize.BIG} autoTextColor={true} />
            <h5>
              <Trans i18nKey='app.slogan' />
            </h5>
            <div className={'mb-5'}>
              <CustomBranding />
            </div>
            <IntroCustomContent />
          </div>
        </EditorToRendererCommunicatorContextProvider>
      }>
      <OidcLoginErrorCard />
      <GuestCard />
      <LocalLoginCard />
      <LdapLoginCards />
      <OneClickLoginCard />
    </TwoColumnLayout>
  )
}

export default LoginPage
