/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { HelpModal } from './help-modal'
import { cypressId } from '../../../../utils/cypress-attribute'
import { useBooleanState } from '../../../../hooks/common/use-boolean-state'

/**
 * Renders the button to open the {@link HelpModal}.
 */
export const HelpButton: React.FC = () => {
  const { t } = useTranslation()
  const [modalVisibility, showModal, closeModal] = useBooleanState()

  return (
    <Fragment>
      <Button
        {...cypressId('editor-help-button')}
        title={t('editor.documentBar.help')}
        className='ms-2 text-secondary'
        size='sm'
        variant='outline-light'
        onClick={showModal}>
        <ForkAwesomeIcon icon='question-circle' />
      </Button>
      <HelpModal show={modalVisibility} onHide={closeModal} />
    </Fragment>
  )
}
