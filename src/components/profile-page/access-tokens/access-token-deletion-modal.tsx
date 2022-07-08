/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react'
import type { ModalVisibilityProps } from '../../common/modals/common-modal'
import { CommonModal } from '../../common/modals/common-modal'
import { cypressId } from '../../../utils/cypress-attribute'
import { Button, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import type { AccessToken } from '../../../api/tokens/types'
import { deleteAccessToken } from '../../../api/tokens'
import { dispatchUiNotification, showErrorNotification } from '../../../redux/ui-notifications/methods'

export interface AccessTokenDeletionModalProps extends ModalVisibilityProps {
  token: AccessToken
}

/**
 * Modal that asks for confirmation when deleting an access token.
 * @param show True when the deletion modal should be shown, false otherwise.
 * @param token The access token to delete.
 * @param onHide Callback that is fired when the modal is closed.
 */
export const AccessTokenDeletionModal: React.FC<AccessTokenDeletionModalProps> = ({ show, token, onHide }) => {
  useTranslation()

  const onConfirmDelete = useCallback(() => {
    deleteAccessToken(token.keyId)
      .then(() => {
        return dispatchUiNotification(
          'profile.modal.deleteAccessToken.notificationTitle',
          'profile.modal.deleteAccessToken.notificationText',
          {}
        )
      })
      .catch(showErrorNotification('profile.modal.deleteAccessToken.failed'))
      .finally(() => onHide?.())
  }, [token, onHide])

  return (
    <CommonModal
      show={show}
      onHide={onHide}
      title={'profile.modal.deleteAccessToken.title'}
      {...cypressId('access-token-modal-delete')}>
      <Modal.Body>
        <Trans i18nKey='profile.modal.deleteAccessToken.message' />
      </Modal.Body>
      <Modal.Footer>
        <Button variant='danger' onClick={onConfirmDelete}>
          <Trans i18nKey={'common.delete'} />
        </Button>
      </Modal.Footer>
    </CommonModal>
  )
}
