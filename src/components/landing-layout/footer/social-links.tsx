/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import links from '../../../links.json'
import { ExternalLink } from '../../common/links/external-link'

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
