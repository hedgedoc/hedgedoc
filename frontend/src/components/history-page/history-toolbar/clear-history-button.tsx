/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../hooks/common/use-boolean-state'
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import { deleteAllHistoryEntries } from '../../../redux/history/methods'
import { cypressId } from '../../../utils/cypress-attribute'
import { UiIcon } from '../../common/icons/ui-icon'
import { DeletionModal } from '../../common/modals/deletion-modal'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import { useSafeRefreshHistoryStateCallback } from './hooks/use-safe-refresh-history-state'
import React, { Fragment, useCallback } from 'react'
import { Button } from 'react-bootstrap'
import { Trash as IconTrash } from 'react-bootstrap-icons'
import { Trans } from 'react-i18next'

/**
 * Renders a button to clear the complete history of the user.
 * A confirmation modal will be presented to the user after clicking the button.
 */
export const ClearHistoryButton: React.FC = () => {
  const [modalVisibility, showModal, closeModal] = useBooleanState()
  const { showErrorNotification } = useUiNotifications()
  const safeRefreshHistoryState = useSafeRefreshHistoryStateCallback()

  const onConfirm = useCallback(() => {
    deleteAllHistoryEntries().catch((error: Error) => {
      showErrorNotification('landing.history.error.deleteEntry.text')(error)
      safeRefreshHistoryState()
    })
    closeModal()
  }, [closeModal, safeRefreshHistoryState, showErrorNotification])

  const buttonTitle = useTranslatedText('landing.history.toolbar.clear')

  return (
    <Fragment>
      <Button variant={'secondary'} title={buttonTitle} onClick={showModal} {...cypressId('history-clear-button')}>
        <UiIcon icon={IconTrash} />
      </Button>
      <DeletionModal
        onConfirm={onConfirm}
        deletionButtonI18nKey={'landing.history.toolbar.clear'}
        show={modalVisibility}
        onHide={closeModal}
        titleI18nKey={'landing.history.modal.clearHistory.title'}>
        <h5>
          <Trans i18nKey={'landing.history.modal.clearHistory.question'} />
        </h5>
        <h6>
          <Trans i18nKey={'landing.history.modal.clearHistory.disclaimer'} />
        </h6>
      </DeletionModal>
    </Fragment>
  )
}
