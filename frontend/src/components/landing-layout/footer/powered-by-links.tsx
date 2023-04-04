/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import links from '../../../links.json'
import { useFrontendConfig } from '../../common/frontend-config-context/use-frontend-config'
import { ExternalLink } from '../../common/links/external-link'
import { TranslatedExternalLink } from '../../common/links/translated-external-link'
import { TranslatedInternalLink } from '../../common/links/translated-internal-link'
import { VersionInfoLink } from './version-info/version-info-link'
import React, { Fragment, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders a powered-by link.
 */
export const PoweredByLinks: React.FC = () => {
  useTranslation()

  const rawSpecialUrls = useFrontendConfig().specialUrls

  const specialUrls = useMemo(
    () => Object.entries(rawSpecialUrls).map(([i18nkey, url]) => [i18nkey, String(url)]),
    [rawSpecialUrls]
  )

  return (
    <p>
      <Trans i18nKey='landing.footer.poweredBy'>
        <ExternalLink href={links.webpage} text='HedgeDoc' />
      </Trans>
      &nbsp;|&nbsp;
      <TranslatedInternalLink href='/n/release-notes' i18nKey='landing.footer.releases' />
      {specialUrls.map(([i18nKey, href]) => (
        <Fragment key={i18nKey}>
          &nbsp;|&nbsp;
          <TranslatedExternalLink href={href} i18nKey={'landing.footer.' + i18nKey} />
        </Fragment>
      ))}
      &nbsp;|&nbsp;
      <VersionInfoLink />
    </p>
  )
}
