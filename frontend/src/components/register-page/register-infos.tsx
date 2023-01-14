/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../hooks/common/use-application-state'
import { TranslatedExternalLink } from '../common/links/translated-external-link'
import { ShowIf } from '../common/show-if/show-if'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders the links to information and conditions on registering an account.
 */
export const RegisterInfos: React.FC = () => {
  useTranslation()
  const specialUrls = useApplicationState((state) => state.config.specialUrls)

  return (
    <ShowIf condition={!!specialUrls.termsOfUse || !!specialUrls.privacy}>
      <Trans i18nKey='login.register.infoTermsPrivacy' />
      <ul>
        <ShowIf condition={!!specialUrls.termsOfUse}>
          <li>
            <TranslatedExternalLink i18nKey='landing.footer.termsOfUse' href={specialUrls.termsOfUse ?? ''} />
          </li>
        </ShowIf>
        <ShowIf condition={!!specialUrls.privacy}>
          <li>
            <TranslatedExternalLink i18nKey='landing.footer.privacy' href={specialUrls.privacy ?? ''} />
          </li>
        </ShowIf>
      </ul>
    </ShowIf>
  )
}
