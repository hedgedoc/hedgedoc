/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../hooks/common/use-boolean-state'
import { deleteAllHistoryEntries } from '../../../redux/history/methods'
import { cypressId } from '../../../utils/cypress-attribute'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { DeletionModal } from '../../common/modals/deletion-modal'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import { useSafeRefreshHistoryStateCallback } from './hooks/use-safe-refresh-history-state'
import React, { Fragment, useCallback } from 'react'
import { Button } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders a button to clear the complete history of the user.
 * A confirmation modal will be presented to the user after clicking the button.
 */
export const ClearHistoryButton: React.FC = () => {
  const { t } = useTranslation()
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

  return (
    <Fragment>
      <Button
        variant={'light'}
        title={t('landing.history.toolbar.clear') ?? undefined}
        onClick={showModal}
        {...cypressId('history-clear-button')}>
        <ForkAwesomeIcon icon={'trash'} />
      </Button>
      <DeletionModal
        onConfirm={onConfirm}
        deletionButtonI18nKey={'landing.history.toolbar.clear'}
        show={modalVisibility}
        onHide={closeModal}
        title={'landing.history.modal.clearHistory.title'}>
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
