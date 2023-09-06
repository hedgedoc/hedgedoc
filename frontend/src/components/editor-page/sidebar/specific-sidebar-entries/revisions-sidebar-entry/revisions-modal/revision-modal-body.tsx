/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getAllRevisions } from '../../../../../../api/revisions'
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { useIsOwner } from '../../../../../../hooks/common/use-is-owner'
import { cypressId } from '../../../../../../utils/cypress-attribute'
import { RevisionList } from './revision-list'
import type { RevisionModal } from './revision-modal'
import { RevisionModalFooter } from './revision-modal-footer'
import styles from './revision-modal.module.scss'
import { RevisionViewer } from './revision-viewer'
import React, { Fragment, useState } from 'react'
import { Col, Modal, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useAsync } from 'react-use'

/**
 * Renders list of revisions and all the actions buttons.
 *
 * @param  onShowDeleteModal Callback to render revisions delete modal
 * @param onHide Callback that gets triggered when revision modal is about to hide.
 */
export const RevisionModalBody = ({ onShowDeleteModal, onHide }: RevisionModal) => {
  useTranslation()
  const isOwner = useIsOwner()
  const [selectedRevisionId, setSelectedRevisionId] = useState<number>()
  const noteId = useApplicationState((state) => state.noteDetails?.id)
  const {
    value: revisions,
    error,
    loading
  } = useAsync(async () => {
    if (!noteId) {
      return []
    }
    return getAllRevisions(noteId)
  }, [noteId])

  const revisionLength = revisions?.length ?? 0
  const enableDeleteRevisions = revisionLength > 1 && isOwner
  return (
    <Fragment>
      <Modal.Body {...cypressId('sidebar.revision.modal')}>
        <Row>
          <Col lg={4} className={styles['scroll-col']}>
            <RevisionList
              error={error}
              loadingRevisions={loading}
              revisions={revisions}
              onRevisionSelect={setSelectedRevisionId}
              selectedRevisionId={selectedRevisionId}
            />
          </Col>
          <Col lg={8} className={styles['scroll-col']}>
            <RevisionViewer selectedRevisionId={selectedRevisionId} />
          </Col>
        </Row>
      </Modal.Body>
      <RevisionModalFooter
        selectedRevisionId={selectedRevisionId}
        onHide={onHide}
        disableDeleteRevisions={!enableDeleteRevisions}
        onShowDeleteModal={onShowDeleteModal}
      />
    </Fragment>
  )
}
