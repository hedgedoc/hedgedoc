/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback } from 'react'
import { Dropdown } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import type { IconName } from '../../common/fork-awesome/types'
import type { DeleteHistoryNoteModalProps } from '../../editor-page/sidebar/delete-note-sidebar-entry/delete-note-modal'
import { DeleteNoteModal } from '../../editor-page/sidebar/delete-note-sidebar-entry/delete-note-modal'
import { useBooleanState } from '../../../hooks/common/use-boolean-state'

export interface DropdownItemWithDeletionModalProps {
  onConfirm: () => void
  itemI18nKey: string
  modalIcon: IconName
  noteTitle: string
  className?: string
}

/**
 * Renders a dropdown item and the corresponding deletion modal
 *
 * @param onConfirm A callback that fires if the user confirmed the request
 * @param noteTitle The note title to be displayed
 * @param modalTitleI18nKey The i18nKey for title to be shown in the modal
 * @param modalButtonI18nKey The i18nKey for button to be shown in the modal
 * @param itemI18nKey The i18nKey for the dropdown item
 * @param modalIcon The icon for the dropdown item
 * @param modalQuestionI18nKey The i18nKey for question to be shown in the modal
 * @param modalWarningI18nKey The i18nKey for warning to be shown in the modal
 * @param className Additional classes given to the dropdown item
 */
export const DropdownItemWithDeletionModal: React.FC<
  DropdownItemWithDeletionModalProps & DeleteHistoryNoteModalProps
> = ({
  onConfirm,
  noteTitle,
  modalTitleI18nKey,
  modalButtonI18nKey,
  itemI18nKey,
  modalIcon,
  modalQuestionI18nKey,
  modalWarningI18nKey,
  className
}) => {
  useTranslation()
  const [modalVisibility, showModal, closeModal] = useBooleanState()

  const handleConfirm = useCallback(() => {
    closeModal()
    onConfirm()
  }, [closeModal, onConfirm])

  return (
    <Fragment>
      <Dropdown.Item onClick={showModal} className={className}>
        <ForkAwesomeIcon icon={modalIcon} fixedWidth={true} className='mx-2' />
        <Trans i18nKey={itemI18nKey} />
      </Dropdown.Item>
      <DeleteNoteModal
        optionalNoteTitle={noteTitle}
        onConfirm={handleConfirm}
        show={modalVisibility}
        onHide={closeModal}
        modalTitleI18nKey={modalTitleI18nKey}
        modalButtonI18nKey={modalButtonI18nKey}
        modalQuestionI18nKey={modalQuestionI18nKey}
        modalWarningI18nKey={modalWarningI18nKey}
      />
    </Fragment>
  )
}
