/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { deleteAccessToken } from '../../../api/api-tokens'
import { cypressId } from '../../../utils/cypress-attribute'
import type { ModalVisibilityProps } from '../../common/modals/common-modal'
import { CommonModal } from '../../common/modals/common-modal'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import React, { useCallback } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import type { ApiTokenDto } from '@hedgedoc/commons'

export interface AccessTokenDeletionModalProps extends ModalVisibilityProps {
  token: ApiTokenDto
}

/**
 * Modal that asks for confirmation when deleting an access token.
 *
 * @param show True when the deletion modal should be shown, false otherwise.
 * @param token The access token to delete.
 * @param onHide Callback that is fired when the modal is closed.
 */
export const AccessTokenDeletionModal: React.FC<AccessTokenDeletionModalProps> = ({ show, token, onHide }) => {
  useTranslation()
  const { showErrorNotification, dispatchUiNotification } = useUiNotifications()

  const onConfirmDelete = useCallback(() => {
    deleteAccessToken(token.keyId)
      .then(() => {
        return dispatchUiNotification(
          'profile.modal.deleteAccessToken.notificationTitle',
          'profile.modal.deleteAccessToken.notificationText',
          {
            contentI18nOptions: {
              label: token.label
            }
          }
        )
      })
      .catch(showErrorNotification('profile.modal.deleteAccessToken.failed'))
      .finally(() => onHide?.())
  }, [token.keyId, token.label, showErrorNotification, dispatchUiNotification, onHide])

  return (
    <CommonModal
      show={show}
      onHide={onHide}
      titleI18nKey={'profile.modal.deleteAccessToken.title'}
      {...cypressId('access-token-modal-delete')}>
      <Modal.Body>
        <Trans i18nKey='profile.modal.deleteAccessToken.message' values={{ label: token.label }} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant='danger' onClick={onConfirmDelete}>
          <Trans i18nKey={'common.delete'} />
        </Button>
      </Modal.Footer>
    </CommonModal>
  )
}
