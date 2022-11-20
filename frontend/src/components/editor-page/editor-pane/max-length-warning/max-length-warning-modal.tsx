/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import type { ModalVisibilityProps } from '../../../common/modals/common-modal'
import { CommonModal } from '../../../common/modals/common-modal'
import { cypressId } from '../../../../utils/cypress-attribute'
import { useApplicationState } from '../../../../hooks/common/use-application-state'

/**
 * Shows a modal that informs the user that the document is too long.
 *
 * @param show is {@code true} if the modal should be shown
 * @param onHide gets called if the modal was closed
 */
export const MaxLengthWarningModal: React.FC<ModalVisibilityProps> = ({ show, onHide }) => {
  useTranslation()
  const maxDocumentLength = useApplicationState((state) => state.config.maxDocumentLength)

  return (
    <CommonModal
      {...cypressId('limitReachedModal')}
      show={show}
      onHide={onHide}
      title={'editor.error.limitReached.title'}
      showCloseButton={true}>
      <Modal.Body>
        <Trans i18nKey={'editor.error.limitReached.description'} values={{ maxDocumentLength }} />
        <strong className='mt-2 d-block'>
          <Trans i18nKey={'editor.error.limitReached.advice'} />
        </strong>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>
          <Trans i18nKey={'common.close'} />
        </Button>
      </Modal.Footer>
    </CommonModal>
  )
}
