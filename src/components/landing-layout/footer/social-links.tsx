import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ExternalLink } from '../../common/links/external-link'
import links from '../../../links.json'

const SocialLink: React.FC = () => {
  useTranslation()
  return (
    <p>
      <Trans i18nKey="landing.footer.followUs" components={[
        <ExternalLink href={links.githubOrg} icon='github' text="GitHub"/>,
        <ExternalLink href={links.community} icon='users' text="Discourse"/>,
        <ExternalLink href={links.chat} icon="comment" text="Matrix"/>,
        <ExternalLink href={links.mastodon} icon='mastodon' text="Mastodon"/>,
        <ExternalLink href={links.translate} icon="globe" text="POEditor"/>
      ]}/>
    </p>
  )
}

export { SocialLink }
