/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getRevision } from '../../../../api/revisions'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import type { ModalVisibilityProps } from '../../../common/modals/common-modal'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'
import { downloadRevision } from './utils'
import React, { useCallback } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

export interface RevisionModalFooterProps {
  selectedRevisionId?: number
}

/**
 * Renders the footer of the revision modal that includes buttons to download the currently selected revision or to
 * revert the note content back to that revision.
 *
 * @param selectedRevisionId The currently selected revision id or undefined if no revision was selected.
 * @param onHide Callback that is fired when the modal is about to be closed.
 */
export const RevisionModalFooter: React.FC<RevisionModalFooterProps & Pick<ModalVisibilityProps, 'onHide'>> = ({
  selectedRevisionId,
  onHide
}) => {
  useTranslation()
  const noteIdentifier = useApplicationState((state) => state.noteDetails.primaryAddress)
  const { showErrorNotification } = useUiNotifications()

  const onRevertToRevision = useCallback(() => {
    // TODO Websocket message handler missing
    // see https://github.com/hedgedoc/hedgedoc/issues/1984
    window.alert('Not yet implemented. Requires websocket.')
  }, [])

  const onDownloadRevision = useCallback(() => {
    if (selectedRevisionId === undefined) {
      return
    }
    getRevision(noteIdentifier, selectedRevisionId)
      .then((revision) => {
        downloadRevision(noteIdentifier, revision)
      })
      .catch(showErrorNotification(''))
  }, [noteIdentifier, selectedRevisionId, showErrorNotification])

  return (
    <Modal.Footer>
      <Button variant='secondary' onClick={onHide}>
        <Trans i18nKey={'common.close'} />
      </Button>
      <Button variant='danger' disabled={selectedRevisionId === undefined} onClick={onRevertToRevision}>
        <Trans i18nKey={'editor.modal.revision.revertButton'} />
      </Button>
      <Button variant='primary' disabled={selectedRevisionId === undefined} onClick={onDownloadRevision}>
        <Trans i18nKey={'editor.modal.revision.download'} />
      </Button>
    </Modal.Footer>
  )
}
