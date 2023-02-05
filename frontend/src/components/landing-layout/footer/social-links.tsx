/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import links from '../../../links.json'
import { ExternalLink } from '../../common/links/external-link'
import React from 'react'
import { Chat as IconChat } from 'react-bootstrap-icons'
import { Github as IconGithub } from 'react-bootstrap-icons'
import { Globe as IconGlobe } from 'react-bootstrap-icons'
import { Mastodon as IconMastodon } from 'react-bootstrap-icons'
import { People as IconPeople } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders links to the social networks.
 */
export const SocialLink: React.FC = () => {
  useTranslation()
  return (
    <p>
      <Trans
        i18nKey='landing.footer.followUs'
        components={[
          <ExternalLink href={links.githubOrg} icon={IconGithub} key={'github'} text='GitHub' />,
          <ExternalLink href={links.community} icon={IconPeople} key={'users'} text='Discourse' />,
          <ExternalLink href={links.chat} icon={IconChat} key={'comment'} text='Matrix' />,
          <ExternalLink href={links.mastodon} icon={IconMastodon} key={'mastodon'} text='Mastodon' />,
          <ExternalLink href={links.translate} icon={IconGlobe} key={'globe'} text='POEditor' />
        ]}
      />
    </p>
  )
}
