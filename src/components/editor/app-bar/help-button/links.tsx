/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import links from '../../../../links.json'
import { ApplicationState } from '../../../../redux'
import { TranslatedExternalLink } from '../../../common/links/translated-external-link'
import { TranslatedInternalLink } from '../../../common/links/translated-internal-link'

export const Links: React.FC = () => {
  useTranslation()

  const backendIssueTracker = useSelector((state: ApplicationState) => state.config.version.issueTrackerUrl)
  return (
    <Row className={'justify-content-center pt-4'}>
      <Col lg={4}>
        <h3><Trans i18nKey='editor.help.contacts.title'/></h3>
        <div>
          <ul className="list-unstyled">
            <li>
              <TranslatedExternalLink
                i18nKey='editor.help.contacts.community'
                href={links.community}
                icon='users'
                className='text-primary'
              />
            </li>
            <li>
              <TranslatedExternalLink
                i18nKey='editor.help.contacts.meetUsOn'
                i18nOption={{ service: 'Matrix' }}
                href={links.chat}
                icon='hashtag'
                className='text-primary'
              />
            </li>
            <li>
              <TranslatedExternalLink
                i18nKey='editor.help.contacts.reportIssue'
                href={backendIssueTracker}
                icon='tag'
                className='text-primary'
              />
            </li>
            <li>
              <TranslatedExternalLink
                i18nKey='editor.help.contacts.helpTranslating'
                href={links.translate}
                icon='language'
                className='text-primary'
              />
            </li>
          </ul>
        </div>
      </Col>
      <Col lg={4}>
        <h3><Trans i18nKey='editor.help.documents.title'/></h3>
        <div>
          <ul className="list-unstyled">
            <li>
              <TranslatedInternalLink
                i18nKey='editor.help.documents.features'
                href='/n/features'
                icon='dot-circle-o'
                className='text-primary'
              />
            </li>
            <li>
              <TranslatedInternalLink
                i18nKey='editor.help.documents.yamlMetadata'
                href='/n/yaml-metadata'
                icon='dot-circle-o'
                className='text-primary'
              />
            </li>
            <li>
              <TranslatedInternalLink
                i18nKey='editor.help.documents.slideExample'
                href='/n/slide-example'
                icon='dot-circle-o'
                className='text-primary'
              />
            </li>
          </ul>
        </div>
      </Col>
    </Row>
  )
}
