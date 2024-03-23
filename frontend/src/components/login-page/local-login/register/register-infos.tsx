/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useFrontendConfig } from '../../../common/frontend-config-context/use-frontend-config'
import { TranslatedExternalLink } from '../../../common/links/translated-external-link'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders the links to information and conditions on registering an account.
 */
export const RegisterInfos: React.FC = () => {
  useTranslation()
  const specialUrls = useFrontendConfig().specialUrls

  if (specialUrls.termsOfUse === undefined && specialUrls.privacy === undefined) {
    return null
  }

  return (
    <>
      <Trans i18nKey='login.register.infoTermsPrivacy' />
      <ul>
        {specialUrls.termsOfUse !== undefined && (
          <li>
            <TranslatedExternalLink i18nKey='appbar.help.legal.termsOfUse' href={specialUrls.termsOfUse ?? ''} />
          </li>
        )}
        {specialUrls.privacy !== undefined && (
          <li>
            <TranslatedExternalLink i18nKey='appbar.help.legal.privacy' href={specialUrls.privacy ?? ''} />
          </li>
        )}
      </ul>
    </>
  )
}
