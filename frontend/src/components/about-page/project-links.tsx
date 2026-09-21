/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Card, ListGroup } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { Flag as IconFlag, Tag as IconTag, Github as IconGithub } from 'react-bootstrap-icons'
import links from '../../links.json'
import { ExternalLink } from '../common/links/external-link'

/**
 * The card used in the about page, that shows the project links.
 */
export const ProjectLinks = () => {
  const { t } = useTranslation()
  return (
    <Card>
      <Card.Body>
        <Card.Title>
          <Trans i18nKey='about.project.heading' />
        </Card.Title>
        <ListGroup>
          <ListGroup.Item>
            <ExternalLink text={t('about.project.github')} icon={IconGithub} href={links.githubOrg} />
          </ListGroup.Item>
          <ListGroup.Item>
            <ExternalLink text={t('about.project.reportIssue')} icon={IconTag} href={links.issues} />
          </ListGroup.Item>
          <ListGroup.Item>
            <ExternalLink text={t('about.project.helpTranslating')} icon={IconFlag} href={links.translate} />
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  )
}
