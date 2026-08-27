'use client'

/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { Card } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { AuthErrorCodes } from '@hedgedoc/commons'
import { useSingleStringUrlParameter } from '../../../hooks/common/use-single-string-url-parameter'

const validAuthErrorCodes = Object.values(AuthErrorCodes)
const i18nKeyMap = {
  [AuthErrorCodes.PROVIDER]: 'errors.oidcLogin.provider',
  [AuthErrorCodes.INVALID_RESPONSE]: 'errors.oidcLogin.invalidResponse',
  [AuthErrorCodes.INTERNAL]: 'errors.oidcLogin.internal'
} as const

/**
 * Renders an error-themed card for the login page depending on the URL parameter `error`.
 */
export const OidcLoginErrorCard: React.FC = () => {
  useTranslation()

  const errorType = useSingleStringUrlParameter('error', null)
  const providerError = useSingleStringUrlParameter('providerError', null)
  const providerDescription = useSingleStringUrlParameter('providerDescription', null)

  if (!errorType || !validAuthErrorCodes.includes(errorType as AuthErrorCodes)) {
    return null
  }

  const descriptionI18nKey = i18nKeyMap[errorType as AuthErrorCodes]
  const providerDetailMessage = errorType === AuthErrorCodes.PROVIDER ? (providerDescription ?? providerError) : null

  return (
    <Card border='danger' className='bg-danger-subtle'>
      <Card.Body>
        <Card.Title className='text-danger'>
          <Trans i18nKey='errors.oidcLogin.title' />
        </Card.Title>
        <p className='mb-0'>
          <Trans i18nKey={descriptionI18nKey} />
        </p>
        {providerDetailMessage !== null && <p className='mb-0 mt-2 text-break small'>{providerDetailMessage}</p>}
      </Card.Body>
    </Card>
  )
}
