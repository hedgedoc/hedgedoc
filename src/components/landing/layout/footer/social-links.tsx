import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ExternalLink } from './external-link'

const SocialLink: React.FC = () => {
  useTranslation()
  return (
    <p>
      <Trans i18nKey="followUs" components={[
        <ExternalLink href="https://github.com/codimd/server" icon={['fab', 'github']} text="GitHub"/>,
        <ExternalLink href="https://community.codimd.org" icon={['fab', 'discourse']} text="Discourse"/>,
        <ExternalLink href="https://riot.im/app/#/room/#codimd:matrix.org" icon="comment" text="Riot"/>,
        <ExternalLink href="https://social.codimd.org/mastodon" icon={['fab', 'mastodon']} text="Mastodon"/>,
        <ExternalLink href="https://translate.codimd.org" icon="globe" text="POEditor"/>
      ]}/>
    </p>
  )
}

export { SocialLink }
