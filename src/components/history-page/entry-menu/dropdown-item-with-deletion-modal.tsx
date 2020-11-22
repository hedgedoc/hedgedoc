/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { Fragment, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { IconName } from '../../common/fork-awesome/types'
import { DeletionModal } from '../../common/modals/deletion-modal'

export interface DropdownItemWithDeletionModalProps {
  onConfirm: () => void
  itemI18nKey: string
  modalButtonI18nKey: string
  modalIcon: IconName
  modalTitleI18nKey: string
  modalQuestionI18nKey: string
  modalWarningI18nKey: string
  noteTitle: string
  className?: string
}

export const DropdownItemWithDeletionModal: React.FC<DropdownItemWithDeletionModalProps> = ({
  onConfirm, noteTitle,
  modalTitleI18nKey, modalButtonI18nKey, itemI18nKey, modalIcon,
  modalQuestionI18nKey, modalWarningI18nKey, className
}) => {
  useTranslation()
  const [showDialog, setShowDialog] = useState(false)

  return (
    <Fragment>
      <Dropdown.Item onClick={() => setShowDialog(true)} className={className}>
        <ForkAwesomeIcon icon={modalIcon} fixedWidth={true} className="mx-2"/>
        <Trans i18nKey={itemI18nKey}/>
      </Dropdown.Item>
      <DeletionModal
        onConfirm={() => {
          setShowDialog(false)
          onConfirm()
        }}
        deletionButtonI18nKey={modalButtonI18nKey}
        show={showDialog}
        onHide={() => setShowDialog(false)}
        titleI18nKey={modalTitleI18nKey}>
        <h5><Trans i18nKey={modalQuestionI18nKey}/></h5>
        <ul>
          <li>{ noteTitle }</li>
        </ul>
        <h6><Trans i18nKey={modalWarningI18nKey}/></h6>
      </DeletionModal>
    </Fragment>
  )
}
