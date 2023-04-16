/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ModalVisibilityProps } from '../../../../../common/modals/common-modal'
import { CommonModal } from '../../../../../common/modals/common-modal'
import { RevisionList } from './revision-list'
import { RevisionModalFooter } from './revision-modal-footer'
import styles from './revision-modal.module.scss'
import { RevisionViewer } from './revision-viewer'
import React, { useState } from 'react'
import { Col, Modal, Row } from 'react-bootstrap'
import { ClockHistory as IconClockHistory } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

/**
 * Modal that shows the available revisions and allows for comparison between them.
 *
 * @param show true to show the modal, false otherwise.
 * @param onHide Callback that is fired when the modal is requested to close.
 */
export const RevisionModal: React.FC<ModalVisibilityProps> = ({ show, onHide }) => {
  useTranslation()
  const [selectedRevisionId, setSelectedRevisionId] = useState<number>()

  return (
    <CommonModal
      show={show}
      onHide={onHide}
      titleI18nKey={'editor.modal.revision.title'}
      titleIcon={IconClockHistory}
      showCloseButton={true}
      modalSize={'xl'}
      additionalClasses={styles['revision-modal']}>
      <Modal.Body>
        <Row>
          <Col lg={4} className={styles['scroll-col']}>
            <RevisionList onRevisionSelect={setSelectedRevisionId} selectedRevisionId={selectedRevisionId} />
          </Col>
          <Col lg={8} className={styles['scroll-col']}>
            <RevisionViewer selectedRevisionId={selectedRevisionId} />
          </Col>
        </Row>
      </Modal.Body>
      <RevisionModalFooter selectedRevisionId={selectedRevisionId} onHide={onHide} />
    </CommonModal>
  )
}
