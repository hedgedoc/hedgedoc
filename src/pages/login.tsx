/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ShowIf } from '../components/common/show-if/show-if'
import { ViaLocal } from '../components/login-page/auth/via-local'
import { ViaLdap } from '../components/login-page/auth/via-ldap'
import { OneClickType, ViaOneClick } from '../components/login-page/auth/via-one-click'
import { useApplicationState } from '../hooks/common/use-application-state'
import { LandingLayout } from '../components/landing-layout/landing-layout'
import { RedirectBack } from '../components/common/redirect-back'

/**
 * Renders the login page with buttons and fields for the enabled auth providers.
 * Redirects the user to the history page if they are already logged in.
 */
export const LoginPage: React.FC = () => {
  useTranslation()
  const authProviders = useApplicationState((state) => state.config.authProviders)
  const customSamlAuthName = useApplicationState((state) => state.config.customAuthNames.saml)
  const customOauthAuthName = useApplicationState((state) => state.config.customAuthNames.oauth2)
  const userLoggedIn = useApplicationState((state) => !!state.user)

  const oneClickProviders = [
    authProviders.dropbox,
    authProviders.facebook,
    authProviders.github,
    authProviders.gitlab,
    authProviders.google,
    authProviders.oauth2,
    authProviders.saml,
    authProviders.twitter
  ]

  const oneClickCustomName = useCallback(
    (type: OneClickType): string | undefined => {
      switch (type) {
        case OneClickType.SAML:
          return customSamlAuthName
        case OneClickType.OAUTH2:
          return customOauthAuthName
        default:
          return undefined
      }
    },
    [customOauthAuthName, customSamlAuthName]
  )

  const oneClickButtonsDom = useMemo(() => {
    return Object.values(OneClickType)
      .filter((value) => authProviders[value])
      .map((value) => (
        <div className='p-2 d-flex flex-column social-button-container' key={value}>
          <ViaOneClick oneClickType={value} optionalName={oneClickCustomName(value)} />
        </div>
      ))
  }, [authProviders, oneClickCustomName])

  if (userLoggedIn) {
    return <RedirectBack />
  }

  return (
    <LandingLayout>
      <div className='my-3'>
        <Row className='h-100 flex justify-content-center'>
          <ShowIf condition={authProviders.local || authProviders.ldap}>
            <Col xs={12} sm={10} lg={4}>
              <ShowIf condition={authProviders.local}>
                <ViaLocal />
              </ShowIf>
              <ShowIf condition={authProviders.ldap}>
                <ViaLdap />
              </ShowIf>
            </Col>
          </ShowIf>
          <ShowIf condition={oneClickProviders.includes(true)}>
            <Col xs={12} sm={10} lg={4}>
              <Card className='bg-dark mb-4'>
                <Card.Body>
                  <Card.Title>
                    <Trans i18nKey='login.signInVia' values={{ service: '' }} />
                  </Card.Title>
                  {oneClickButtonsDom}
                </Card.Body>
              </Card>
            </Col>
          </ShowIf>
        </Row>
      </div>
    </LandingLayout>
  )
}

export default LoginPage
