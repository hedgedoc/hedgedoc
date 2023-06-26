/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import links from '../../../../links.json'
import { IconMatrixOrg } from '../../../common/icons/additional/icon-matrix-org'
import { TranslatedExternalLink } from '../../../common/links/translated-external-link'
import { TranslatedInternalLink } from '../../../common/links/translated-internal-link'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { Dot as IconDot, Flag as IconFlag, PeopleFill as IconPeopleFill, Tag as IconTag } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders a bunch of links, where further help can be requested.
 */
export const LinksTabContent: React.FC = () => {
  useTranslation()

  return (
    <Row className={'justify-content-center pt-4'}>
      <Col lg={4}>
        <h3>
          <Trans i18nKey='editor.help.contacts.title' />
        </h3>
        <div>
          <ul className='list-unstyled'>
            <li>
              <TranslatedExternalLink
                i18nKey='editor.help.contacts.community'
                href={links.community}
                icon={IconPeopleFill}
                className='text-primary'
              />
            </li>
            <li>
              <TranslatedExternalLink
                i18nKey='editor.help.contacts.meetUsOn'
                i18nOption={{ service: 'Matrix' }}
                href={links.chat}
                icon={IconMatrixOrg}
                className='text-primary'
              />
            </li>
            <li>
              <TranslatedExternalLink
                i18nKey='editor.help.contacts.reportIssue'
                href={links.issues}
                icon={IconTag}
                className='text-primary'
              />
            </li>
            <li>
              <TranslatedExternalLink
                i18nKey='editor.help.contacts.helpTranslating'
                href={links.translate}
                icon={IconFlag}
                className='text-primary'
              />
            </li>
          </ul>
        </div>
      </Col>
      <Col lg={4}>
        <h3>
          <Trans i18nKey='editor.help.documents.title' />
        </h3>
        <div>
          <ul className='list-unstyled'>
            <li>
              <TranslatedInternalLink
                i18nKey='editor.help.documents.yamlMetadata'
                href='/n/yaml-metadata'
                icon={IconDot}
                className='text-primary'
              />
            </li>
            <li>
              <TranslatedInternalLink
                i18nKey='editor.help.documents.slideExample'
                href='/n/slide-example'
                icon={IconDot}
                className='text-primary'
              />
            </li>
          </ul>
        </div>
      </Col>
    </Row>
  )
}
