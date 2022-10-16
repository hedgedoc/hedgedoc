/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { CopyableField } from '../../../common/copyable/copyable-field/copyable-field'
import type { ModalVisibilityProps } from '../../../common/modals/common-modal'
import { CommonModal } from '../../../common/modals/common-modal'
import { ShowIf } from '../../../common/show-if/show-if'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { NoteType } from '../../../../redux/note-details/types/note-details'
import { useBaseUrl } from '../../../../hooks/common/use-base-url'

/**
 * Renders a modal which provides shareable URLs of this note.
 *
 * @param show If the modal should be shown
 * @param onHide The callback when the modal should be closed
 */
export const ShareModal: React.FC<ModalVisibilityProps> = ({ show, onHide }) => {
  useTranslation()
  const noteFrontmatter = useApplicationState((state) => state.noteDetails.frontmatter)
  const baseUrl = useBaseUrl()
  const noteIdentifier = useApplicationState((state) => state.noteDetails.primaryAddress)

  return (
    <CommonModal show={show} onHide={onHide} showCloseButton={true} title={'editor.modal.shareLink.title'}>
      <Modal.Body>
        <Trans i18nKey={'editor.modal.shareLink.editorDescription'} />
        <CopyableField content={`${baseUrl}n/${noteIdentifier}`} shareOriginUrl={`${baseUrl}n/${noteIdentifier}`} />
        <ShowIf condition={noteFrontmatter.type === NoteType.SLIDE}>
          <Trans i18nKey={'editor.modal.shareLink.slidesDescription'} />
          <CopyableField content={`${baseUrl}p/${noteIdentifier}`} shareOriginUrl={`${baseUrl}p/${noteIdentifier}`} />
        </ShowIf>
        <ShowIf condition={noteFrontmatter.type === NoteType.DOCUMENT}>
          <Trans i18nKey={'editor.modal.shareLink.viewOnlyDescription'} />
          <CopyableField content={`${baseUrl}s/${noteIdentifier}`} shareOriginUrl={`${baseUrl}s/${noteIdentifier}`} />
        </ShowIf>
      </Modal.Body>
    </CommonModal>
  )
}
