'use client'

/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment } from 'react'
import { Button } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { AccessTokensSection } from './access-tokens-section'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { AuthProviderType } from '@hedgedoc/commons'
import { NotLoggedInMessage } from '../not-logged-in-message'

/**
 * Shows API token management and the instance's OpenAPI documentation.
 */
export const ApiTab: React.FC = () => {
  useTranslation()
  const authProvider = useApplicationState((state) => state.user?.authProvider)

  if (!authProvider || authProvider === AuthProviderType.GUEST) {
    return <NotLoggedInMessage />
  }

  return (
    <Fragment>
      <h2 className={'mb-3 h4'}>
        <Trans i18nKey={'preferences.api.title'} />
      </h2>
      <p>
        <Trans i18nKey={'preferences.api.info'} />
      </p>
      <p className={'my-2'}>
        <Button variant='link' className='p-0' href='/api/doc/v2' target={'_blank'}>
          <Trans i18nKey='preferences.api.documentation' />
        </Button>
      </p>
      <AccessTokensSection />
    </Fragment>
  )
}
