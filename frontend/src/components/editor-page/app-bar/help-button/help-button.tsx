/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../../hooks/common/use-boolean-state'
import { cypressId } from '../../../../utils/cypress-attribute'
import { IconButton } from '../../../common/icon-button/icon-button'
import { HelpModal } from './help-modal'
import React, { Fragment } from 'react'
import { QuestionCircle as IconQuestionCircle } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders the button to open the {@link HelpModal}.
 */
export const HelpButton: React.FC = () => {
  const { t } = useTranslation()
  const [modalVisibility, showModal, closeModal] = useBooleanState()

  return (
    <Fragment>
      <IconButton
        icon={IconQuestionCircle}
        {...cypressId('editor-help-button')}
        title={t('editor.documentBar.help') ?? undefined}
        className='ms-2'
        size='sm'
        variant='outline-dark'
        onClick={showModal}>
        <Trans i18nKey={'editor.documentBar.help'} />
      </IconButton>
      <HelpModal show={modalVisibility} onHide={closeModal} />
    </Fragment>
  )
}
