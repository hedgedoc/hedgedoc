/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import links from '../../../links.json'
import { ExternalLink } from '../../common/links/external-link'

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
          <ExternalLink href={links.githubOrg} icon='github' key={'github'} text='GitHub' />,
          <ExternalLink href={links.community} icon='users' key={'users'} text='Discourse' />,
          <ExternalLink href={links.chat} icon='comment' key={'comment'} text='Matrix' />,
          <ExternalLink href={links.mastodon} icon='mastodon' key={'mastodon'} text='Mastodon' />,
          <ExternalLink href={links.translate} icon='globe' key={'globe'} text='POEditor' />
        ]}
      />
    </p>
  )
}
