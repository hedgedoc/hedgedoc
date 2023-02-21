/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../../hooks/common/use-boolean-state'
import { cypressId } from '../../../../utils/cypress-attribute'
import { CommonModal } from '../../../common/modals/common-modal'
import { CheatsheetModalBody } from './cheatsheet-modal-body'
import React, { Fragment } from 'react'
import { Button } from 'react-bootstrap'
import { QuestionCircle as IconQuestionCircle } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

export const CheatsheetButton: React.FC = () => {
  const { t } = useTranslation()
  const [modalVisibility, showModal, closeModal] = useBooleanState()

  return (
    <Fragment>
      <Button
        {...cypressId('open.cheatsheet-button')}
        title={t('cheatsheet.button') ?? undefined}
        className={'mx-2'}
        variant='outline-dark'
        size={'sm'}
        onClick={showModal}>
        <Trans i18nKey={'cheatsheet.button'}></Trans>
      </Button>
      <CommonModal
        modalSize={'xl'}
        titleIcon={IconQuestionCircle}
        show={modalVisibility}
        onHide={closeModal}
        titleI18nKey={'cheatsheet.modal.title'}>
        <CheatsheetModalBody />
      </CommonModal>
    </Fragment>
  )
}
