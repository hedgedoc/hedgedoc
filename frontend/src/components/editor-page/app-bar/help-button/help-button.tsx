/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../../hooks/common/use-boolean-state'
import { useTranslatedText } from '../../../../hooks/common/use-translated-text'
import { useOutlineButtonVariant } from '../../../../hooks/dark-mode/use-outline-button-variant'
import { cypressId } from '../../../../utils/cypress-attribute'
import { IconButton } from '../../../common/icon-button/icon-button'
import { HelpModal } from './help-modal'
import React, { Fragment } from 'react'
import { QuestionCircle as IconQuestionCircle } from 'react-bootstrap-icons'
import { Trans } from 'react-i18next'

/**
 * Renders the button to open the {@link HelpModal}.
 */
export const HelpButton: React.FC = () => {
  const [modalVisibility, showModal, closeModal] = useBooleanState()
  const buttonVariant = useOutlineButtonVariant()
  const buttonTitle = useTranslatedText('editor.documentBar.help')

  return (
    <Fragment>
      <IconButton
        icon={IconQuestionCircle}
        {...cypressId('editor-help-button')}
        title={buttonTitle}
        className='ms-2'
        size='sm'
        variant={buttonVariant}
        onClick={showModal}>
        <Trans i18nKey={'editor.documentBar.help'} />
      </IconButton>
      <HelpModal show={modalVisibility} onHide={closeModal} />
    </Fragment>
  )
}
