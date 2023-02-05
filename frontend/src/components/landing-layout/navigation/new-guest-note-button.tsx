/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../utils/cypress-attribute'
import { UiIcon } from '../../common/icons/ui-icon'
import Link from 'next/link'
import React from 'react'
import { Button } from 'react-bootstrap'
import { Plus as IconPlus } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders a button to create a new note as a guest.
 */
export const NewGuestNoteButton: React.FC = () => {
  const { t } = useTranslation()
  return (
    <Link href={'/new'} passHref={true}>
      <Button
        title={t('landing.navigation.newGuestNote') ?? undefined}
        variant='primary'
        size='sm'
        className='d-inline-flex align-items-center'
        {...cypressId('new-guest-note-button')}>
        <UiIcon icon={IconPlus} className='mx-1' size={2} />
        <span>
          <Trans i18nKey='landing.navigation.newGuestNote' />
        </span>
      </Button>
    </Link>
  )
}
