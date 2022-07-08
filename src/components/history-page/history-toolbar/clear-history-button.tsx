/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback } from 'react'
import { Button } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { DeletionModal } from '../../common/modals/deletion-modal'
import { deleteAllHistoryEntries, safeRefreshHistoryState } from '../../../redux/history/methods'
import { showErrorNotification } from '../../../redux/ui-notifications/methods'
import { cypressId } from '../../../utils/cypress-attribute'
import { useBooleanState } from '../../../hooks/common/use-boolean-state'

export const ClearHistoryButton: React.FC = () => {
  const { t } = useTranslation()
  const [modalVisibility, showModal, closeModal] = useBooleanState()

  const onConfirm = useCallback(() => {
    deleteAllHistoryEntries().catch((error: Error) => {
      showErrorNotification('landing.history.error.deleteEntry.text')(error)
      safeRefreshHistoryState()
    })
    closeModal()
  }, [closeModal])

  return (
    <Fragment>
      <Button
        variant={'light'}
        title={t('landing.history.toolbar.clear')}
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
