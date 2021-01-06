/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import equal from 'fast-deep-equal'
import React, { Fragment, useState } from 'react'
import { Button, Col, Modal, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ApplicationState } from '../../../redux'
import frontendVersion from '../../../version.json'
import { CopyableField } from '../../common/copyable/copyable-field/copyable-field'
import { TranslatedExternalLink } from '../../common/links/translated-external-link'
import { ShowIf } from '../../common/show-if/show-if'

export const VersionInfo: React.FC = () => {
  const [show, setShow] = useState(false)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const { t } = useTranslation()

  const serverVersion = useSelector((state: ApplicationState) => state.config.version, equal)

  const column = (title: string, version: string, sourceCodeLink: string, issueTrackerLink: string) => (
    <Col md={6} className={'flex-column'}>
      <h5>{title}</h5>
      <CopyableField content={version}/>
      <ShowIf condition={!!sourceCodeLink}>
        <TranslatedExternalLink i18nKey={'landing.versionInfo.sourceCode'} className={'btn btn-sm btn-primary d-block mb-2'} href={sourceCodeLink}/>
      </ShowIf>
      <ShowIf condition={!!issueTrackerLink}>
        <TranslatedExternalLink i18nKey={'landing.versionInfo.issueTracker'} className={'btn btn-sm btn-primary d-block mb-2'} href={issueTrackerLink}/>
      </ShowIf>
    </Col>
  )

  return (
    <Fragment>
      <Link id='version' to={'#'} className={'text-light'} onClick={handleShow}>
        <Trans i18nKey={'landing.versionInfo.versionInfo'}/>
      </Link>
      <Modal id='versionModal' show={show} onHide={handleClose} animation={true}>
        <Modal.Body className="text-dark">
          <h3><Trans i18nKey={'landing.versionInfo.title'}/></h3>
          <Row>
            {column(t('landing.versionInfo.serverVersion'), serverVersion.version, serverVersion.sourceCodeUrl, serverVersion.issueTrackerUrl)}
            {column(t('landing.versionInfo.clientVersion'), frontendVersion.version, frontendVersion.sourceCodeUrl, frontendVersion.issueTrackerUrl)}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            <Trans i18nKey={'common.close'}/>
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}
