/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import links from '../../../links.json'
import { ExternalLink } from '../../common/links/external-link'
import { TranslatedExternalLink } from '../../common/links/translated-external-link'
import { TranslatedInternalLink } from '../../common/links/translated-internal-link'
import { VersionInfoLink } from './version-info/version-info-link'
import React, { Fragment } from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders a powered-by link.
 */
export const PoweredByLinks: React.FC = () => {
  useTranslation()

  const specialUrls: [string, string][] = useApplicationState((state) =>
    Object.entries(state.config.specialUrls).map(([i18nkey, url]) => [i18nkey, String(url)])
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
