'use client'

/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NextPage } from 'next'
import { Trans, useTranslation } from 'react-i18next'
import React from 'react'
import { useIsLoggedIn } from '../../../hooks/common/use-is-logged-in'
import { RedirectToParamOrExplore } from '../../../components/login-page/redirect-to-param-or-explore'
import { NewUserCard } from '../../../components/login-page/new-user/new-user-card'
import { TwoColumnLayout } from '../../../components/layout/two-column-layout'
import { HedgeDocLogoVertical } from '../../../components/common/hedge-doc-logo/hedge-doc-logo-vertical'
import { LogoSize } from '../../../components/common/hedge-doc-logo/logo-size'
import { CustomBranding } from '../../../components/common/custom-branding/custom-branding'
import { IntroCustomContent } from '../../../components/intro-page/intro-custom-content'
import { EditorToRendererCommunicatorContextProvider } from '../../../components/editor-page/render-context/editor-to-renderer-communicator-context-provider'

/**
 * Renders the page where users pick a username when they first log in via SSO.
 */
const NewUserPage: NextPage = () => {
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
      <NewUserCard />
    </TwoColumnLayout>
  )
}

export default NewUserPage
