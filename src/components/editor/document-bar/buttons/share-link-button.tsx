/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import equal from 'fast-deep-equal'
import React, { Fragment, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useFrontendBaseUrl } from '../../../../hooks/common/use-frontend-base-url'
import { ApplicationState } from '../../../../redux'
import { CopyableField } from '../../../common/copyable/copyable-field/copyable-field'
import { TranslatedIconButton } from '../../../common/icon-button/translated-icon-button'
import { CommonModal } from '../../../common/modals/common-modal'
import { ShowIf } from '../../../common/show-if/show-if'
import { EditorPathParams } from '../../editor'

export const ShareLinkButton: React.FC = () => {
  useTranslation()
  const [showShareDialog, setShowShareDialog] = useState(false)
  const noteMetadata = useSelector((state: ApplicationState) => state.documentContent.metadata, equal)
  const editorMode = useSelector((state: ApplicationState) => state.editorConfig.editorMode)
  const baseUrl = useFrontendBaseUrl()
  const { id } = useParams<EditorPathParams>()

  return (
    <Fragment>
      <TranslatedIconButton
        size={'sm'}
        className={'mx-1'}
        icon={'share'}
        variant={'light'}
        onClick={() => setShowShareDialog(true)}
        i18nKey={'editor.documentBar.shareLink'}
      />
      <CommonModal
        show={showShareDialog}
        onHide={() => setShowShareDialog(false)}
        closeButton={true}
        titleI18nKey={'editor.modal.shareLink.title'}>
        <Modal.Body>
          <Trans i18nKey={'editor.modal.shareLink.editorDescription'}/>
          <CopyableField content={`${baseUrl}/n/${id}?${editorMode}`} nativeShareButton={true} url={`${baseUrl}/n/${id}?${editorMode}`}/>
          <ShowIf condition={noteMetadata.type === 'slide'}>
            <Trans i18nKey={'editor.modal.shareLink.slidesDescription'}/>
            <CopyableField content={`${baseUrl}/p/${id}`} nativeShareButton={true} url={`${baseUrl}/p/${id}`}/>
          </ShowIf>
          <ShowIf condition={noteMetadata.type === ''}>
            <Trans i18nKey={'editor.modal.shareLink.viewOnlyDescription'}/>
            <CopyableField content={`${baseUrl}/s/${id}`} nativeShareButton={true} url={`${baseUrl}/s/${id}`}/>
          </ShowIf>
        </Modal.Body>
      </CommonModal>
    </Fragment>
  )
}
