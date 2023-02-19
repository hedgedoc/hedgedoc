/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { deleteUser } from '../../../api/me'
import { clearUser } from '../../../redux/user/methods'
import { CountdownButton } from '../../common/countdown-button/countdown-button'
import type { ModalVisibilityProps } from '../../common/modals/common-modal'
import { CommonModal } from '../../common/modals/common-modal'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import React, { useCallback } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Confirmation modal for deleting your account.
 *
 * @param show True if the modal should be shown, false otherwise.
 * @param onHide Callback that is fired when the modal is closed.
 */
export const AccountDeletionModal: React.FC<ModalVisibilityProps> = ({ show, onHide }) => {
  useTranslation()
  const { showErrorNotification, dispatchUiNotification } = useUiNotifications()

  const deleteUserAccount = useCallback(() => {
    deleteUser()
      .then(() => {
        clearUser()
        return dispatchUiNotification(
          'profile.modal.deleteUser.notificationTitle',
          'profile.modal.deleteUser.notificationText',
          {}
        )
      })
      .catch(showErrorNotification('profile.modal.deleteUser.failed'))
      .finally(() => {
        if (onHide) {
          onHide()
        }
      })
  }, [dispatchUiNotification, onHide, showErrorNotification])

  return (
    <CommonModal show={show} titleI18nKey={'profile.modal.deleteUser.message'} onHide={onHide} showCloseButton={true}>
      <Modal.Body>
        <Trans i18nKey='profile.modal.deleteUser.subMessage' />
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={onHide}>
          <Trans i18nKey='common.close' />
        </Button>
        <CountdownButton variant='danger' onClick={deleteUserAccount} countdownStartSeconds={10}>
          <Trans i18nKey={'profile.modal.deleteUser.title'} />
        </CountdownButton>
      </Modal.Footer>
    </CommonModal>
  )
}
