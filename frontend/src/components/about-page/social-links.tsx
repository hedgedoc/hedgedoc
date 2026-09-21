/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ExternalLink } from '../common/links/external-link'
import links from '../../links.json'
import { Trans, useTranslation } from 'react-i18next'
import { Card, ListGroup } from 'react-bootstrap'
import { IconDiscourse } from '../common/icons/additional/icon-discourse'
import { IconMatrixOrg } from '../common/icons/additional/icon-matrix-org'
import { Mastodon as IconMastodon } from 'react-bootstrap-icons'

/**
 * The card used in the about page, that shows the social links.
 */
export const SocialLinks = () => {
  const { t } = useTranslation()
  return (
    <Card>
      <Card.Body>
        <Card.Title>
          <Trans i18nKey='about.social.heading' />
        </Card.Title>
        <ListGroup>
          <ListGroup.Item>
            <ExternalLink text={t('about.social.discourse')} icon={IconDiscourse} href={links.community} />
          </ListGroup.Item>
          <ListGroup.Item>
            <ExternalLink text={t('about.social.matrix')} icon={IconMatrixOrg} href={links.chat} />
          </ListGroup.Item>
          <ListGroup.Item>
            <ExternalLink text={t('about.social.mastodon')} icon={IconMastodon} href={links.mastodon} />
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  )
}
