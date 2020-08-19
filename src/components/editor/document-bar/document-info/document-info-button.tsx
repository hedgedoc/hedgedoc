import moment from 'moment'
import React, { Fragment, useState } from 'react'
import { ListGroup, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { CommonModal } from '../../../common/modals/common-modal'
import { DocumentInfoLine } from './document-info-line'
import { DocumentInfoLineWithTimeMode, DocumentInfoTimeLine } from './document-info-time-line'
import { UnitalicBoldText } from './unitalic-bold-text'
import { TranslatedIconButton } from '../../../common/icon-button/translated-icon-button'

export const DocumentInfoButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  useTranslation()

  return (
    <Fragment>
      <TranslatedIconButton size={'sm'} className={'mx-1'} icon={'line-chart'} variant={'light'} onClick={() => setShowModal(true)} i18nKey={'editor.documentBar.documentInfo'}/>
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
                profileImageSrc={'/avatar.png'}/>
            </ListGroup.Item>
            <ListGroup.Item>
              <DocumentInfoTimeLine
                mode={DocumentInfoLineWithTimeMode.EDITED}
                time={ moment().subtract(3, 'minutes') }
                userName={'Philip'}
                profileImageSrc={'/avatar.png'}/>
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
