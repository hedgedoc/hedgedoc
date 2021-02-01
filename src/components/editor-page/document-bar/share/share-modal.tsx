/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import equal from 'fast-deep-equal'
import React from 'react'
import { Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useFrontendBaseUrl } from '../../../../hooks/common/use-frontend-base-url'
import { ApplicationState } from '../../../../redux'
import { CopyableField } from '../../../common/copyable/copyable-field/copyable-field'
import { CommonModal } from '../../../common/modals/common-modal'
import { ShowIf } from '../../../common/show-if/show-if'
import { EditorPagePathParams } from '../../editor-page'

export interface ShareModalProps {
  show: boolean,
  onHide: () => void
}

export const ShareModal: React.FC<ShareModalProps> = ({ show, onHide }) => {
  useTranslation()
  const noteFrontmatter = useSelector((state: ApplicationState) => state.noteDetails.frontmatter, equal)
  const editorMode = useSelector((state: ApplicationState) => state.editorConfig.editorMode)
  const baseUrl = useFrontendBaseUrl()
  const { id } = useParams<EditorPagePathParams>()

  return (
    <CommonModal
      show={show}
      onHide={onHide}
      closeButton={true}
      titleI18nKey={'editor.modal.shareLink.title'}>
      <Modal.Body>
        <Trans i18nKey={'editor.modal.shareLink.editorDescription'}/>
        <CopyableField content={`${baseUrl}/n/${id}?${editorMode}`} nativeShareButton={true}
                       url={`${baseUrl}/n/${id}?${editorMode}`}/>
        <ShowIf condition={noteFrontmatter.type === 'slide'}>
          <Trans i18nKey={'editor.modal.shareLink.slidesDescription'}/>
          <CopyableField content={`${baseUrl}/p/${id}`} nativeShareButton={true} url={`${baseUrl}/p/${id}`}/>
        </ShowIf>
        <ShowIf condition={noteFrontmatter.type === ''}>
          <Trans i18nKey={'editor.modal.shareLink.viewOnlyDescription'}/>
          <CopyableField content={`${baseUrl}/s/${id}`} nativeShareButton={true} url={`${baseUrl}/s/${id}`}/>
        </ShowIf>
      </Modal.Body>
    </CommonModal>
  )
}
