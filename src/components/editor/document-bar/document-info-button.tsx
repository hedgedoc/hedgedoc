import moment from 'moment'
import React, { Fragment, useState } from 'react'
import { Button, ListGroup, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { CommonModal } from '../../common/modals/common-modal'
import { DocumentInfoLine } from './document-info-line'
import { DocumentInfoLineWithTimeMode, DocumentInfoTimeLine } from './document-info-time-line'
import { UnitalicBoldText } from './document-info-time-line-helper/unitalic-bold-text'

export const DocumentInfoButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  useTranslation()

  return (
    <Fragment>
      <Button variant={'light'} className={'mx-1'} size={'sm'} onClick={() => setShowModal(true)}>
        <ForkAwesomeIcon icon={'line-chart'} className={'mx-1'}/>
        <Trans i18nKey={'editor.documentBar.documentInfo'}/>
      </Button>
      <CommonModal
        show={showModal}
        onHide={() => setShowModal(false)}
        closeButton={true}
        titleI18nKey={'editor.modal.documentInfo.title'}>
        <Modal.Body>
          <ListGroup>
            <ListGroup.Item>
              <DocumentInfoTimeLine
                mode={DocumentInfoLineWithTimeMode.CREATED}
                time={ moment().subtract(11, 'days') }
                userName={'Tilman'}
                profileImageSrc={'https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=200&r=pg&d=mp'}/>
            </ListGroup.Item>
            <ListGroup.Item>
              <DocumentInfoTimeLine
                mode={DocumentInfoLineWithTimeMode.EDITED}
                time={ moment().subtract(3, 'minutes') }
                userName={'Philip'}
                profileImageSrc={'https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=200&r=pg&d=mp'}/>
            </ListGroup.Item>
            <ListGroup.Item>
              <DocumentInfoLine icon={'users'}>
                <Trans i18nKey='editor.modal.documentInfo.usersContributed'>
                  <UnitalicBoldText text={'42'}/>
                </Trans>
              </DocumentInfoLine>
            </ListGroup.Item>
            <ListGroup.Item>
              <DocumentInfoLine icon={'history'}>
                <Trans i18nKey='editor.modal.documentInfo.revisions'>
                  <UnitalicBoldText text={'192'}/>
                </Trans>
              </DocumentInfoLine>
            </ListGroup.Item>
          </ListGroup>
        </Modal.Body>
      </CommonModal>
    </Fragment>
  )
}
