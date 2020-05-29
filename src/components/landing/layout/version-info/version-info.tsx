import React, { Fragment, useState } from 'react'
import { Button, Col, Modal, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ApplicationState } from '../../../../redux'
import frontendVersion from '../../../../version.json'
import { TranslatedExternalLink } from '../../../links/translated-external-link'
import { VersionInputField } from './version-input-field'

export const VersionInfo: React.FC = () => {
  const [show, setShow] = useState(false)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const { t } = useTranslation()

  const serverVersion = useSelector((state: ApplicationState) => state.backendConfig.version)

  const column = (title: string, version: string, sourceCodeLink: string, issueTrackerLink: string) => (
    <Col md={6} className={'flex-column'}>
      <h5>{title}</h5>
      <VersionInputField version={version}/>
      {sourceCodeLink
        ? <TranslatedExternalLink i18nKey={'sourceCode'} className={'btn btn-sm btn-primary d-block mb-2'} href={sourceCodeLink}/> : null}
      {issueTrackerLink
        ? <TranslatedExternalLink i18nKey={'issueTracker'} className={'btn btn-sm btn-primary d-block mb-2'} href={issueTrackerLink}/> : null}
    </Col>
  )

  return (
    <Fragment>
      <Link to={'#'} className={'text-light'} onClick={handleShow}><Trans i18nKey={'versionInfo'}/></Link>
      <Modal show={show} onHide={handleClose} animation={true}>
        <Modal.Body className="text-dark">
          <h3><Trans i18nKey={'youAreUsing'}/></h3>
          <Row>
            {column(t('serverVersion'), serverVersion.version, serverVersion.sourceCodeUrl, serverVersion.issueTrackerUrl)}
            {column(t('clientVersion'), frontendVersion.version, frontendVersion.sourceCodeUrl, frontendVersion.issueTrackerUrl)}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            <Trans i18nKey={'close'}/>
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}
