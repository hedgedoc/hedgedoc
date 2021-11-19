/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { HelpModal } from './help-modal'
import { cypressId } from '../../../../utils/cypress-attribute'

export const HelpButton: React.FC = () => {
  const { t } = useTranslation()
  const [show, setShow] = useState(false)
  const onHide = useCallback(() => setShow(false), [])

  return (
    <Fragment>
      <Button
        {...cypressId('editor-help-button')}
        title={t('editor.documentBar.help')}
        className='ml-2 text-secondary'
        size='sm'
        variant='outline-light'
        onClick={() => setShow(true)}>
        <ForkAwesomeIcon icon='question-circle' />
      </Button>
      <HelpModal show={show} onHide={onHide} />
    </Fragment>
  )
}
