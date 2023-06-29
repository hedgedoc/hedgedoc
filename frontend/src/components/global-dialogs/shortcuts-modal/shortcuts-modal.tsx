/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import type { ModalVisibilityProps } from '../../common/modals/common-modal'
import { CommonModal } from '../../common/modals/common-modal'
import { ShortcutsContent } from './shortcuts-content'
import React from 'react'
import { Modal } from 'react-bootstrap'
import { QuestionCircle as IconQuestionCircle } from 'react-bootstrap-icons'

/**
 * Renders the keyboard shortcuts overview modal.
 * @param show True when the modal should be shown
 * @param onHide Callback when the modal should be hidden
 */
export const ShortcutsModal: React.FC<ModalVisibilityProps> = ({ show, onHide }) => {
  const title = useTranslatedText('shortcuts.title')

  return (
    <CommonModal titleIcon={IconQuestionCircle} show={show} onHide={onHide} showCloseButton={true} title={title}>
      <Modal.Body>
        <ShortcutsContent />
      </Modal.Body>
    </CommonModal>
  )
}
