/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { deleteRevisionsForNote } from '../../../../../../api/revisions'
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { cypressId } from '../../../../../../utils/cypress-attribute'
import type { ModalVisibilityProps } from '../../../../../common/modals/common-modal'
import { CommonModal } from '../../../../../common/modals/common-modal'
import { useUiNotifications } from '../../../../../notifications/ui-notification-boundary'
import React, { useCallback } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Trans } from 'react-i18next'

/**
 * This modal for deletion of notes's revision
 *
 * @param show true to show the modal, false otherwise.
 * @param onHide Callback that is fired when the modal is requested to close.
 */
export const RevisionDeleteModal: React.FC<ModalVisibilityProps> = ({ show, onHide }) => {
  const { showErrorNotification } = useUiNotifications()
  const noteId = useApplicationState((state) => state.noteDetails?.id)

  const deleteAllRevisions = useCallback(() => {
    if (!noteId) {
      return
    }
    deleteRevisionsForNote(noteId).catch(showErrorNotification('editor.modal.deleteRevision.error')).finally(onHide)
  }, [noteId, onHide, showErrorNotification])

  return (
    <CommonModal
      show={show}
      onHide={onHide}
      titleI18nKey={'editor.modal.deleteRevision.title'}
      showCloseButton={true}
      {...cypressId('revision.delete.modal')}>
      <Modal.Body>
        <h6>
          <Trans i18nKey={'editor.modal.deleteRevision.warning'} />
        </h6>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='danger' onClick={deleteAllRevisions} {...cypressId('revision.delete.button')}>
          <Trans i18nKey={'editor.modal.deleteRevision.button'} />
        </Button>
      </Modal.Footer>
    </CommonModal>
  )
}
