/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../utils/cypress-attribute'
import { IconButton } from '../icon-button/icon-button'
import Link from 'next/link'
import React from 'react'
import { FileEarmarkPlus as IconPlus } from 'react-bootstrap-icons'
import { Trans } from 'react-i18next'

/**
 * Links to the "new note" endpoint
 */
export const NewNoteButton: React.FC = () => {
  return (
    <Link href={'/new'} passHref={true}>
      <IconButton {...cypressId('new-note-button')} iconSize={1.5} size={'sm'} icon={IconPlus}>
        <Trans i18nKey='navigation.newNote' />
      </IconButton>
    </Link>
  )
}
