import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { TranslatedExternalLink } from '../../../common/links/translated-external-link'
import { TranslatedInternalLink } from '../../../common/links/translated-internal-link'

export const Links: React.FC = () => {
  useTranslation()
  return (
    <Row className={'justify-content-center pt-4'}>
      <Col lg={4}>
        <h3><Trans i18nKey='editor.help.contacts.title'/></h3>
        <div>
          <ul className="list-unstyled">
            <li>
              <TranslatedExternalLink
                i18nKey='editor.help.contacts.community'
                href='https://community.codimd.org/'
                icon='users'
                className='text-primary'
              />
            </li>
            <li>
              <TranslatedExternalLink
                i18nKey='editor.help.contacts.meetUsOn'
                i18nOption={{ service: 'Matrix' }}
                href='https://riot.im/app/#/room/#codimd:matrix.org'
                icon='hashtag'
                className='text-primary'
              />
            </li>
            <li>
              <TranslatedExternalLink
                i18nKey='editor.help.contacts.reportIssue'
                href='https://github.com/codimd/server/issues'
                icon='tag'
                className='text-primary'
              />
            </li>
            <li>
              <TranslatedExternalLink
                i18nKey='editor.help.contacts.helpTranslating'
                href='https://translate.codimd.org/'
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
                href='/n/yaml-data'
                icon='dot-circle-o'
                className='text-primary'
              />
            </li>
            <li>
              <TranslatedExternalLink
                i18nKey='editor.help.documents.slideExample'
                href='https://github.com/codimd/server/issues'
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
