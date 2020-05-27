import { Trans, useTranslation } from 'react-i18next'
import { TranslatedLink } from './translated-link'
import React, { Fragment } from 'react'
import { ExternalLink } from './external-link'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../../redux'

export const PoweredByLinks: React.FC = () => {
  useTranslation()

  const defaultLinks =
    {
      releases: '/s/release-notes',
      sourceCode: 'https://github.com/codimd/server/tree/41b13e71b6b1d499238c04b15d65e3bd76442f1d'
    }

  const config = useSelector((state: ApplicationState) => state.backendConfig)

  return (
    <p>
      <Trans i18nKey="poweredBy" components={[<ExternalLink href="https://codimd.org" text="CodiMD"/>]}/>
      {
        Object.entries({ ...defaultLinks, ...(config.specialLinks) }).map(([i18nKey, href]) =>
          <Fragment key={i18nKey}>
            &nbsp;|&nbsp;
            <TranslatedLink
              href={href}
              i18nKey={i18nKey}
            />
          </Fragment>
        )
      }
    </p>
  )
}
