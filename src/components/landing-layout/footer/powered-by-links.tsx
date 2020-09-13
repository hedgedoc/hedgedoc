import React, { Fragment } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../redux'
import { ExternalLink } from '../../common/links/external-link'
import { TranslatedExternalLink } from '../../common/links/translated-external-link'
import { TranslatedInternalLink } from '../../common/links/translated-internal-link'
import { VersionInfo } from './version-info'
import links from '../../../links.json'

export const PoweredByLinks: React.FC = () => {
  useTranslation()

  const specialLinks = useSelector((state: ApplicationState) => Object.entries(state.config.specialLinks) as [string, string][])

  return (
    <p>
      <Trans i18nKey="landing.footer.poweredBy">
        <ExternalLink href={links.webpage} text="HedgeDoc"/>
      </Trans>
      &nbsp;|&nbsp;
      <TranslatedInternalLink href='/n/release-notes' i18nKey='landing.footer.releases'/>
      {
        specialLinks.map(([i18nKey, href]) =>
          <Fragment key={i18nKey}>
            &nbsp;|&nbsp;
            <TranslatedExternalLink href={href} i18nKey={'landing.footer.' + i18nKey}/>
          </Fragment>
        )
      }
      &nbsp;|&nbsp;
      <VersionInfo/>
    </p>
  )
}
