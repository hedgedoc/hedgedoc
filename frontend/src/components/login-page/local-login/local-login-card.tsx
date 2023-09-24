/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { Card } from 'react-bootstrap'
import { useFrontendConfig } from '../../common/frontend-config-context/use-frontend-config'
import { AuthProviderType } from '../../../api/config/types'
import { LocalLoginCardBody } from './local-login-card-body'
import { LocalRegisterCardBody } from './register/local-register-card-body'
import { ShowIf } from '../../common/show-if/show-if'

/**
 * Shows the card that processes local logins and registers.
 */
export const LocalLoginCard: React.FC = () => {
  const frontendConfig = useFrontendConfig()

  const localLoginEnabled = useMemo(() => {
    return frontendConfig.authProviders.some((provider) => provider.type === AuthProviderType.LOCAL)
  }, [frontendConfig])

  if (!localLoginEnabled) {
    return null
  }

  return (
    <Card>
      <LocalLoginCardBody />
      <ShowIf condition={frontendConfig.allowRegister}>
        <hr className={'m-0'} />
        <LocalRegisterCardBody />
      </ShowIf>
    </Card>
  )
}
