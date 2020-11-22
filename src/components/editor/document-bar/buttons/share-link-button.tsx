/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { Fragment, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { Trans } from 'react-i18next'
import { CopyableField } from '../../../common/copyable/copyable-field/copyable-field'
import { TranslatedIconButton } from '../../../common/icon-button/translated-icon-button'
import { CommonModal } from '../../../common/modals/common-modal'

export const ShareLinkButton: React.FC = () => {
  const [showReadOnly, setShowReadOnly] = useState(false)

  return (
    <Fragment>
      <TranslatedIconButton size={'sm'} className={'mx-1'} icon={'share'} variant={'light'} onClick={() => setShowReadOnly(true)} i18nKey={'editor.documentBar.shareLink'}/>
      <CommonModal
        show={showReadOnly}
        onHide={() => setShowReadOnly(false)}
        closeButton={true}
        titleI18nKey={'editor.modal.shareLink.title'}>
        <Modal.Body>
          <span className={'my-4'}><Trans i18nKey={'editor.modal.shareLink.viewOnlyDescription'}/></span>
          <CopyableField content={'https://example.com'}/>
        </Modal.Body>
      </CommonModal>
    </Fragment>
  )
}
