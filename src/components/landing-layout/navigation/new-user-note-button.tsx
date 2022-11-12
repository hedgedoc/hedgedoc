/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Button } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { cypressId } from '../../../utils/cypress-attribute'
import Link from 'next/link'

/**
 * Renders a button to create a new note as a logged in user.
 */
export const NewUserNoteButton: React.FC = () => {
  const { t } = useTranslation()
  return (
    <Link href={'/new'} passHref={true}>
      <Button
        title={t('landing.navigation.newNote') ?? undefined}
        variant='primary'
        size='sm'
        className='d-inline-flex align-items-center'
        {...cypressId('new-note-button')}>
        <ForkAwesomeIcon icon='plus' className='mx-1' />
        <span>
          <Trans i18nKey='landing.navigation.newNote' />
        </span>
      </Button>
    </Link>
  )
}
