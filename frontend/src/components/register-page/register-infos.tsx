/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useFrontendConfig } from '../common/frontend-config-context/use-frontend-config'
import { TranslatedExternalLink } from '../common/links/translated-external-link'
import { ShowIf } from '../common/show-if/show-if'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders the links to information and conditions on registering an account.
 */
export const RegisterInfos: React.FC = () => {
  useTranslation()
  const specialUrls = useFrontendConfig().specialUrls

  return (
    <ShowIf condition={!!specialUrls.termsOfUse || !!specialUrls.privacy}>
      <Trans i18nKey='login.register.infoTermsPrivacy' />
      <ul>
        <ShowIf condition={!!specialUrls.termsOfUse}>
          <li>
            <TranslatedExternalLink i18nKey='appBar.legal.termsOfUse' href={specialUrls.termsOfUse ?? ''} />
          </li>
        </ShowIf>
        <ShowIf condition={!!specialUrls.privacy}>
          <li>
            <TranslatedExternalLink i18nKey='appBar.legal.privacy' href={specialUrls.privacy ?? ''} />
          </li>
        </ShowIf>
      </ul>
    </ShowIf>
  )
}
