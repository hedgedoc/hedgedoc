/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import { DateTime } from 'luxon'
import React, { Fragment, useState } from 'react'
import { ListGroup, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { TranslatedIconButton } from '../../../common/icon-button/translated-icon-button'
import { CommonModal } from '../../../common/modals/common-modal'
import { DocumentInfoLine } from './document-info-line'
import { DocumentInfoLineWithTimeMode, DocumentInfoTimeLine } from './document-info-time-line'
import { UnitalicBoldText } from './unitalic-bold-text'

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
                size={'2x'}
                mode={DocumentInfoLineWithTimeMode.CREATED}
                time={DateTime.local().minus({ days: 11 })}
                userName={'Tilman'}
                profileImageSrc={'/img/avatar.png'}/>
            </ListGroup.Item>
            <ListGroup.Item>
              <DocumentInfoTimeLine
                size={'2x'}
                mode={DocumentInfoLineWithTimeMode.EDITED}
                time={DateTime.local().minus({ minutes: 3 })}
                userName={'Philip'}
                profileImageSrc={'/img/avatar.png'}/>
            </ListGroup.Item>
            <ListGroup.Item>
              <DocumentInfoLine icon={'users'} size={'2x'}>
                <Trans i18nKey='editor.modal.documentInfo.usersContributed'>
                  <UnitalicBoldText text={'42'}/>
                </Trans>
              </DocumentInfoLine>
            </ListGroup.Item>
            <ListGroup.Item>
              <DocumentInfoLine icon={'history'} size={'2x'}>
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
