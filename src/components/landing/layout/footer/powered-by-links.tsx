import React, { Fragment } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../../redux'
import { ExternalLink } from '../../../links/external-link'
import { TranslatedExternalLink } from '../../../links/translated-external-link'
import { VersionInfo } from '../version-info/version-info'

export const PoweredByLinks: React.FC = () => {
  useTranslation()

  const defaultLinks =
    {
      releases: '/n/release-notes'
    }

  const config = useSelector((state: ApplicationState) => state.backendConfig)

  return (
    <p>
      <Trans i18nKey="poweredBy">
        <ExternalLink href="https://codimd.org" text="CodiMD"/>
      </Trans>
      {
        Object.entries({ ...defaultLinks, ...(config.specialLinks) }).map(([i18nKey, href]) =>
          <Fragment key={i18nKey}>
            &nbsp;|&nbsp;
            <TranslatedExternalLink href={href} i18nKey={i18nKey}/>
          </Fragment>
        )
      }
      &nbsp;|&nbsp;
      <VersionInfo/>
    </p>
  )
}
