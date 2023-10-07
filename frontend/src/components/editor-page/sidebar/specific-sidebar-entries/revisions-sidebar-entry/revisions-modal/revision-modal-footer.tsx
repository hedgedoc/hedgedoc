/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getRevision } from '../../../../../../api/revisions'
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { cypressId } from '../../../../../../utils/cypress-attribute'
import type { ModalVisibilityProps } from '../../../../../common/modals/common-modal'
import { useUiNotifications } from '../../../../../notifications/ui-notification-boundary'
import type { RevisionModalProps } from './revision-modal'
import { downloadRevision } from './utils'
import React, { useCallback } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

interface RevisionModalFooter {
  selectedRevisionId?: number
  disableDeleteRevisions: boolean
}

type RevisionModalFooterProps = RevisionModalProps & RevisionModalFooter & Pick<ModalVisibilityProps, 'onHide'>

/**
 * Renders the footer of the revision modal that includes buttons to download the currently selected revision or to
 * revert the note content back to that revision.
 *
 * @param selectedRevisionId The currently selected revision id or undefined if no revision was selected.
 * @param onHide Callback that is fired when the modal is about to be closed.
 * @param onShowDeleteModal Callback to render revision deleteModal.
 * @param disableDeleteRevisions Boolean to disable delete button.
 */
export const RevisionModalFooter: React.FC<RevisionModalFooterProps> = ({
  selectedRevisionId,
  onHide,
  onShowDeleteModal,
  disableDeleteRevisions
}) => {
  useTranslation()
  const noteId = useApplicationState((state) => state.noteDetails?.id)
  const { showErrorNotification } = useUiNotifications()

  const onRevertToRevision = useCallback(() => {
    // TODO Websocket message handler missing
    //  see https://github.com/hedgedoc/hedgedoc/issues/1984
    window.alert('Not yet implemented. Requires websocket.')
  }, [])

  const onDownloadRevision = useCallback(() => {
    if (selectedRevisionId === undefined || noteId === undefined) {
      return
    }
    getRevision(noteId, selectedRevisionId)
      .then((revision) => {
        downloadRevision(noteId, revision)
      })
      .catch(showErrorNotification(''))
  }, [noteId, selectedRevisionId, showErrorNotification])

  const openDeleteModal = useCallback(() => {
    onHide?.()
    onShowDeleteModal()
  }, [onHide, onShowDeleteModal])

  return (
    <Modal.Footer>
      <Button variant='secondary' onClick={onHide}>
        <Trans i18nKey={'common.close'} />
      </Button>
      <Button
        variant='danger'
        onClick={openDeleteModal}
        {...cypressId('revision.modal.delete.button')}
        disabled={disableDeleteRevisions}>
        <Trans i18nKey={'editor.modal.deleteRevision.button'} />
      </Button>
      <Button
        variant='danger'
        disabled={selectedRevisionId === undefined}
        onClick={onRevertToRevision}
        {...cypressId('revision.modal.revert.button')}>
        <Trans i18nKey={'editor.modal.revision.revertButton'} />
      </Button>
      <Button
        variant='primary'
        disabled={selectedRevisionId === undefined}
        onClick={onDownloadRevision}
        {...cypressId('revision.modal.download.button')}>
        <Trans i18nKey={'editor.modal.revision.download'} />
      </Button>
    </Modal.Footer>
  )
}
