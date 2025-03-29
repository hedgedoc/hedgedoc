/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../utils/cypress-attribute'
import { CopyableField } from '../../common/copyable/copyable-field/copyable-field'
import type { ModalVisibilityProps } from '../../common/modals/common-modal'
import { CommonModal } from '../../common/modals/common-modal'
import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Trans } from 'react-i18next'
import type { ApiTokenWithSecretDto } from '@hedgedoc/commons'

export interface AccessTokenCreatedModalProps extends ModalVisibilityProps {
  tokenWithSecret?: ApiTokenWithSecretDto
}

/**
 * Modal that shows the secret of a freshly created access token.
 *
 * @param show True when the modal should be shown, false otherwise.
 * @param onHide Callback that gets called when the modal should be dismissed.
 * @param tokenWithSecret The token altogether with its secret.
 */
export const AccessTokenCreatedModal: React.FC<AccessTokenCreatedModalProps> = ({ show, onHide, tokenWithSecret }) => {
  if (!tokenWithSecret) {
    return null
  }

  return (
    <CommonModal
      show={show}
      onHide={onHide}
      titleI18nKey='profile.modal.addedAccessToken.title'
      {...cypressId('access-token-modal-add')}>
      <Modal.Body>
        <Trans
          i18nKey='profile.modal.addedAccessToken.message'
          values={{
            label: tokenWithSecret.label
          }}
        />
        <br />
        <CopyableField content={tokenWithSecret.secret} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant='primary' onClick={onHide}>
          <Trans i18nKey='common.close' />
        </Button>
      </Modal.Footer>
    </CommonModal>
  )
}
