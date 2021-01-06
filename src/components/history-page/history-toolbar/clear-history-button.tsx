/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { Fragment, useState } from 'react'
import { Button } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { DeletionModal } from '../../common/modals/deletion-modal'

export interface ClearHistoryButtonProps {
  onClearHistory: () => void
}

export const ClearHistoryButton: React.FC<ClearHistoryButtonProps> = ({ onClearHistory }) => {
  const { t } = useTranslation()
  const [show, setShow] = useState(false)

  const handleShow = () => setShow(true)
  const handleClose = () => setShow(false)

  return (
    <Fragment>
      <Button variant={'light'} title={t('landing.history.toolbar.clear')} onClick={handleShow}>
        <ForkAwesomeIcon icon={'trash'}/>
      </Button>
      <DeletionModal
        onConfirm={() => {
          onClearHistory()
          handleClose()
        }}
        deletionButtonI18nKey={'landing.history.toolbar.clear'}
        show={show}
        onHide={handleClose}
        titleI18nKey={'landing.history.modal.clearHistory.title'}
      >
        <h5><Trans i18nKey={'landing.history.modal.clearHistory.question'}/></h5>
        <h6><Trans i18nKey={'landing.history.modal.clearHistory.disclaimer'}/></h6>
      </DeletionModal>
    </Fragment>
  )
}
