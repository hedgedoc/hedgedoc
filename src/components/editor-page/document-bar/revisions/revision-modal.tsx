/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useRef, useState } from 'react'
import { Alert, Button, Col, ListGroup, Modal, Row } from 'react-bootstrap'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer'
import { Trans, useTranslation } from 'react-i18next'
import { getAllRevisions, getRevision } from '../../../../api/revisions'
import type { Revision, RevisionListEntry } from '../../../../api/revisions/types'
import type { UserResponse } from '../../../../api/users/types'
import { useIsDarkModeActivated } from '../../../../hooks/common/use-is-dark-mode-activated'
import { useNoteMarkdownContent } from '../../../../hooks/common/use-note-markdown-content'
import type { ModalVisibilityProps } from '../../../common/modals/common-modal'
import { CommonModal } from '../../../common/modals/common-modal'
import { ShowIf } from '../../../common/show-if/show-if'
import { RevisionModalListEntry } from './revision-modal-list-entry'
import styles from './revision-modal.module.scss'
import { downloadRevision, getUserDataForRevision } from './utils'
import { useApplicationState } from '../../../../hooks/common/use-application-state'

export const RevisionModal: React.FC<ModalVisibilityProps> = ({ show, onHide }) => {
  useTranslation()
  const [revisions, setRevisions] = useState<RevisionListEntry[]>([])
  const [selectedRevisionTimestamp, setSelectedRevisionTimestamp] = useState<number | null>(null)
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null)
  const [error, setError] = useState(false)
  const revisionAuthorListMap = useRef(new Map<number, UserResponse[]>())
  const darkModeEnabled = useIsDarkModeActivated()
  const id = useApplicationState((state) => state.noteDetails.id)

  useEffect(() => {
    if (!show) {
      return
    }
    getAllRevisions(id)
      .then((fetchedRevisions) => {
        fetchedRevisions.forEach((revision) => {
          const authorData = getUserDataForRevision(revision.authors)
          revisionAuthorListMap.current.set(revision.timestamp, authorData)
        })
        setRevisions(fetchedRevisions)
        if (fetchedRevisions.length >= 1) {
          setSelectedRevisionTimestamp(fetchedRevisions[0].timestamp)
        }
      })
      .catch(() => setError(true))
  }, [setRevisions, setError, id, show])

  useEffect(() => {
    if (selectedRevisionTimestamp === null) {
      return
    }
    getRevision(id, selectedRevisionTimestamp)
      .then((fetchedRevision) => {
        setSelectedRevision(fetchedRevision)
      })
      .catch(() => setError(true))
  }, [selectedRevisionTimestamp, id])

  const markdownContent = useNoteMarkdownContent()

  return (
    <CommonModal
      show={show}
      onHide={onHide}
      title={'editor.modal.revision.title'}
      titleIcon={'history'}
      showCloseButton={true}
      modalSize={'xl'}
      additionalClasses={styles['revision-modal']}>
      <Modal.Body>
        <Row>
          <Col lg={4} className={styles['scroll-col']}>
            <ListGroup as='ul'>
              {revisions.map((revision, revisionIndex) => (
                <RevisionModalListEntry
                  key={revisionIndex}
                  active={selectedRevisionTimestamp === revision.timestamp}
                  revision={revision}
                  revisionAuthorListMap={revisionAuthorListMap.current}
                  onClick={() => setSelectedRevisionTimestamp(revision.timestamp)}
                />
              ))}
            </ListGroup>
          </Col>
          <Col lg={8} className={styles['scroll-col']}>
            <ShowIf condition={error}>
              <Alert variant='danger'>
                <Trans i18nKey='editor.modal.revision.error' />
              </Alert>
            </ShowIf>
            <ShowIf condition={!error && !!selectedRevision}>
              <ReactDiffViewer
                oldValue={selectedRevision?.content}
                newValue={markdownContent}
                splitView={false}
                compareMethod={DiffMethod.WORDS}
                useDarkTheme={darkModeEnabled}
              />
            </ShowIf>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={onHide}>
          <Trans i18nKey={'common.close'} />
        </Button>
        <Button
          variant='danger'
          disabled={!selectedRevisionTimestamp}
          onClick={() => window.alert('Not yet implemented. Requires websocket.')}>
          <Trans i18nKey={'editor.modal.revision.revertButton'} />
        </Button>
        <Button
          variant='primary'
          disabled={!selectedRevisionTimestamp}
          onClick={() => downloadRevision(id, selectedRevision)}>
          <Trans i18nKey={'editor.modal.revision.download'} />
        </Button>
      </Modal.Footer>
    </CommonModal>
  )
}
