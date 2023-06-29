/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../hooks/common/use-boolean-state'
import { useTranslatedText } from '../../hooks/common/use-translated-text'
import { useOutlineButtonVariant } from '../../hooks/dark-mode/use-outline-button-variant'
import { cypressId } from '../../utils/cypress-attribute'
import { CommonModal } from '../common/modals/common-modal'
import { CheatsheetContent } from './cheatsheet-content'
import { CheatsheetInNewTabButton } from './cheatsheet-in-new-tab-button'
import React, { Fragment } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Trans } from 'react-i18next'

/**
 * Shows a button that opens the cheatsheet dialog.
 */
export const CheatsheetButton: React.FC = () => {
  const [modalVisibility, showModal, closeModal] = useBooleanState()
  const buttonVariant = useOutlineButtonVariant()
  const buttonTitle = useTranslatedText('cheatsheet.button')

  return (
    <Fragment>
      <Button
        {...cypressId('open.cheatsheet-button')}
        title={buttonTitle}
        className={'mx-2'}
        variant={buttonVariant}
        size={'sm'}
        onClick={showModal}>
        <Trans i18nKey={'cheatsheet.button'}></Trans>
      </Button>
      <CommonModal
        modalSize={'xl'}
        show={modalVisibility}
        onHide={closeModal}
        showCloseButton={true}
        titleI18nKey={'cheatsheet.modal.title'}
        additionalTitleElement={
          <div className={'d-flex flex-row-reverse w-100 mx-2'}>
            <CheatsheetInNewTabButton onClick={closeModal} />
          </div>
        }>
        <Modal.Body>
          <CheatsheetContent />
        </Modal.Body>
      </CommonModal>
    </Fragment>
  )
}
