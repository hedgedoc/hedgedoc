/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { Card } from 'react-bootstrap'
import { useFrontendConfig } from '../../common/frontend-config-context/use-frontend-config'
import { ProviderType } from '@hedgedoc/commons'
import { LocalLoginCardBody } from './local-login-card-body'
import { LocalRegisterCardBody } from './register/local-register-card-body'

/**
 * Shows the card that processes local logins and registers.
 */
export const LocalLoginCard: React.FC = () => {
  const frontendConfig = useFrontendConfig()

  const localLoginEnabled = useMemo(() => {
    return frontendConfig.authProviders.some((provider) => provider.type === ProviderType.LOCAL)
  }, [frontendConfig])

  if (!localLoginEnabled) {
    return null
  }

  return (
    <Card>
      <LocalLoginCardBody />
      {frontendConfig.allowRegister && (
        <>
          <hr className={'m-0'} />
          <LocalRegisterCardBody />
        </>
      )}
    </Card>
  )
}
