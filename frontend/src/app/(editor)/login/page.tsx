'use client'

/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AuthProviderWithCustomName } from '../../../api/config/types'
import { AuthProviderType } from '../../../api/config/types'
import { useFrontendConfig } from '../../../components/common/frontend-config-context/use-frontend-config'
import { RedirectBack } from '../../../components/common/redirect-back'
import { ShowIf } from '../../../components/common/show-if/show-if'
import { LandingLayout } from '../../../components/landing-layout/landing-layout'
import { filterOneClickProviders } from '../../../components/login-page/auth/utils'
import { ViaLdap } from '../../../components/login-page/auth/via-ldap'
import { ViaLocal } from '../../../components/login-page/auth/via-local'
import { ViaOneClick } from '../../../components/login-page/auth/via-one-click'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import type { NextPage } from 'next'
import React, { useMemo } from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders the login page with buttons and fields for the enabled auth providers.
 * Redirects the user to the history page if they are already logged in.
 */
const LoginPage: NextPage = () => {
  useTranslation()
  const authProviders = useFrontendConfig().authProviders
  const userLoggedIn = useApplicationState((state) => !!state.user)

  const ldapProviders = useMemo(() => {
    return authProviders
      .filter((provider) => provider.type === AuthProviderType.LDAP)
      .map((provider) => {
        const ldapProvider = provider as AuthProviderWithCustomName
        return (
          <ViaLdap
            providerName={ldapProvider.providerName}
            identifier={ldapProvider.identifier}
            key={ldapProvider.identifier}
          />
        )
      })
  }, [authProviders])

  const localLoginEnabled = useMemo(() => {
    return authProviders.some((provider) => provider.type === AuthProviderType.LOCAL)
  }, [authProviders])

  const oneClickProviders = useMemo(() => {
    return authProviders.filter(filterOneClickProviders).map((provider, index) => (
      <div className={'p-2 d-flex flex-column social-button-container'} key={index}>
        <ViaOneClick provider={provider} />
      </div>
    ))
  }, [authProviders])

  if (userLoggedIn) {
    return <RedirectBack />
  }

  return (
    <LandingLayout>
      <div className='my-3'>
        <Row className='h-100 d-flex justify-content-center'>
          <ShowIf condition={ldapProviders.length > 0 || localLoginEnabled}>
            <Col xs={12} sm={10} lg={4}>
              <ShowIf condition={localLoginEnabled}>
                <ViaLocal />
              </ShowIf>
              {ldapProviders}
            </Col>
          </ShowIf>
          <ShowIf condition={oneClickProviders.length > 0}>
            <Col xs={12} sm={10} lg={4}>
              <Card className='mb-4'>
                <Card.Body>
                  <Card.Title>
                    <Trans i18nKey='login.signInVia' values={{ service: '' }} />
                  </Card.Title>
                  {oneClickProviders}
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
