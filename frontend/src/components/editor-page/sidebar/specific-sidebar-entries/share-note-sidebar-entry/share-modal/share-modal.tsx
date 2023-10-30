/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import type { ModalVisibilityProps } from '../../../../../common/modals/common-modal'
import { CommonModal } from '../../../../../common/modals/common-modal'
import { LinkType, NoteUrlField } from './note-url-field'
import { NoteType } from '@hedgedoc/commons'
import React from 'react'
import { Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders a modal which provides shareable URLs of this note.
 *
 * @param show If the modal should be shown
 * @param onHide The callback when the modal should be closed
 */
export const ShareModal: React.FC<ModalVisibilityProps> = ({ show, onHide }) => {
  useTranslation()
  const noteFrontmatter = useApplicationState((state) => state.noteDetails?.frontmatter)

  if (!noteFrontmatter) {
    return null
  }

  return (
    <CommonModal show={show} onHide={onHide} showCloseButton={true} titleI18nKey={'editor.modal.shareLink.title'}>
      <Modal.Body>
        <Trans i18nKey={'editor.modal.shareLink.editorDescription'} />
        <NoteUrlField type={LinkType.EDITOR} />
        {noteFrontmatter.type === NoteType.SLIDE && (
          <>
            <Trans i18nKey={'editor.modal.shareLink.slidesDescription'} />
            <NoteUrlField type={LinkType.SLIDESHOW} />
          </>
        )}
        {noteFrontmatter.type === NoteType.DOCUMENT && (
          <>
            <Trans i18nKey={'editor.modal.shareLink.viewOnlyDescription'} />
            <NoteUrlField type={LinkType.DOCUMENT} />
          </>
        )}
      </Modal.Body>
    </CommonModal>
  )
}
