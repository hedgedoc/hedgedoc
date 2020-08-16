import React, { Fragment } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../redux'
import { ExternalLink } from '../../common/links/external-link'
import { TranslatedExternalLink } from '../../common/links/translated-external-link'
import { TranslatedInternalLink } from '../../common/links/translated-internal-link'
import { VersionInfo } from './version-info'

export const PoweredByLinks: React.FC = () => {
  useTranslation()

  const config = useSelector((state: ApplicationState) => state.config)

  return (
    <p>
      <Trans i18nKey="landing.footer.poweredBy">
        <ExternalLink href="https://codimd.org" text="CodiMD"/>
      </Trans>
      &nbsp;|&nbsp;
      <TranslatedInternalLink href='/n/release-notes' i18nKey='landing.footer.releases'/>
      {
        Object.entries({ ...config.specialLinks }).map(([i18nKey, href]) =>
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
