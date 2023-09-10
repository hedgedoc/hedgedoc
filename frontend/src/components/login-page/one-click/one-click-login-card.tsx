/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { Card } from 'react-bootstrap'
import { Trans } from 'react-i18next'
import { useFrontendConfig } from '../../common/frontend-config-context/use-frontend-config'
import { OneClickLoginButton } from './one-click-login-button'
import { filterOneClickProviders } from '../utils/filter-one-click-providers'

/**
 * Shows a card that contains buttons to all one click auth providers.
 */
export const OneClickLoginCard: React.FC = () => {
  const authProviders = useFrontendConfig().authProviders

  const oneClickProviders = useMemo(() => {
    return filterOneClickProviders(authProviders).map((provider, index) => (
      <div className={'p-2 d-flex flex-column social-button-container'} key={index}>
        <OneClickLoginButton provider={provider} />
      </div>
    ))
  }, [authProviders])

  return oneClickProviders.length === 0 ? null : (
    <Card>
      <Card.Body>
        <Card.Title>
          <Trans i18nKey='login.signInVia' values={{ service: '' }} />
        </Card.Title>
        {oneClickProviders}
      </Card.Body>
    </Card>
  )
}
