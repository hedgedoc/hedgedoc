/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react'
import type { MediaEntryProps } from './media-entry'
import type { ModalVisibilityProps } from '../../../../common/modals/common-modal'
import { DeletionModal } from '../../../../common/modals/deletion-modal'
import { deleteUploadedMedia } from '../../../../../api/media'
import { useUiNotifications } from '../../../../notifications/ui-notification-boundary'
import { Trans, useTranslation } from 'react-i18next'

type MediaEntryDeletionModalProps = Pick<MediaEntryProps, 'entry'> & ModalVisibilityProps

/**
 * Renders a modal for confirming the deletion of a media entry.
 *
 * @param entry The media entry to delete
 * @param show Whether the modal should be shown
 * @param onHide The callback when the modal should be hidden
 */
export const MediaEntryDeletionModal: React.FC<MediaEntryDeletionModalProps> = ({ entry, show, onHide }) => {
  useTranslation()
  const { showErrorNotification, dispatchUiNotification } = useUiNotifications()

  const handleDelete = useCallback(() => {
    deleteUploadedMedia(entry.uuid)
      .then(() => {
        dispatchUiNotification('common.success', 'editor.mediaBrowser.mediaDeleted', {})
      })
      .catch(showErrorNotification('editor.mediaBrowser.errorDeleting'))
      .finally(onHide)
  }, [showErrorNotification, dispatchUiNotification, entry, onHide])

  return (
    <DeletionModal
      onConfirm={handleDelete}
      deletionButtonI18nKey={'common.delete'}
      show={show}
      onHide={onHide}
      titleI18nKey={'editor.mediaBrowser.deleteMedia'}>
      <Trans i18nKey={'editor.mediaBrowser.confirmDeletion'} />
    </DeletionModal>
  )
}
