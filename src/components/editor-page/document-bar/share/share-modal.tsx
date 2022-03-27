/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
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
import { useFrontendBaseUrl } from '../../../../hooks/common/use-frontend-base-url'

export const ShareModal: React.FC<ModalVisibilityProps> = ({ show, onHide }) => {
  useTranslation()
  const noteFrontmatter = useApplicationState((state) => state.noteDetails.frontmatter)
  const editorMode = useApplicationState((state) => state.editorConfig.editorMode)
  const baseUrl = useFrontendBaseUrl()
  const id = useApplicationState((state) => state.noteDetails.id)

  return (
    <CommonModal show={show} onHide={onHide} showCloseButton={true} title={'editor.modal.shareLink.title'}>
      <Modal.Body>
        <Trans i18nKey={'editor.modal.shareLink.editorDescription'} />
        <CopyableField content={`${baseUrl}n/${id}?${editorMode}`} shareOriginUrl={`${baseUrl}n/${id}?${editorMode}`} />
        <ShowIf condition={noteFrontmatter.type === NoteType.SLIDE}>
          <Trans i18nKey={'editor.modal.shareLink.slidesDescription'} />
          <CopyableField content={`${baseUrl}p/${id}`} shareOriginUrl={`${baseUrl}p/${id}`} />
        </ShowIf>
        <ShowIf condition={noteFrontmatter.type === NoteType.DOCUMENT}>
          <Trans i18nKey={'editor.modal.shareLink.viewOnlyDescription'} />
          <CopyableField content={`${baseUrl}s/${id}`} shareOriginUrl={`${baseUrl}s/${id}`} />
        </ShowIf>
      </Modal.Body>
    </CommonModal>
  )
}
