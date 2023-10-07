'use client'

/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NextPage } from 'next'
import { EditorToRendererCommunicatorContextProvider } from '../../../components/editor-page/render-context/editor-to-renderer-communicator-context-provider'
import { HedgeDocLogoVertical } from '../../../components/common/hedge-doc-logo/hedge-doc-logo-vertical'
import { LogoSize } from '../../../components/common/hedge-doc-logo/logo-size'
import { Trans } from 'react-i18next'
import { CustomBranding } from '../../../components/common/custom-branding/custom-branding'
import { IntroCustomContent } from '../../../components/intro-page/intro-custom-content'
import React from 'react'
import { RedirectToParamOrHistory } from '../../../components/login-page/redirect-to-param-or-history'
import { Col, Container, Row } from 'react-bootstrap'
import { LocalLoginCard } from '../../../components/login-page/local-login/local-login-card'
import { LdapLoginCards } from '../../../components/login-page/ldap/ldap-login-cards'
import { OneClickLoginCard } from '../../../components/login-page/one-click/one-click-login-card'
import { GuestCard } from '../../../components/login-page/guest/guest-card'
import { useIsLoggedIn } from '../../../hooks/common/use-is-logged-in'

const LoginPage: NextPage = () => {
  const userLoggedIn = useIsLoggedIn()

  if (userLoggedIn) {
    return <RedirectToParamOrHistory />
  }

  return (
    <Container>
      <Row>
        <Col xs={8}>
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
        </Col>
        <Col xs={4} className={'pt-3 d-flex gap-3 flex-column'}>
          <GuestCard />
          <LocalLoginCard />
          <LdapLoginCards />
          <OneClickLoginCard />
        </Col>
      </Row>
    </Container>
  )
}

export default LoginPage
