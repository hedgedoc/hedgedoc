/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IconButton } from '../../common/icon-button/icon-button'
import Link from 'next/link'
import React from 'react'
import { Plus as IconPlus } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders a button to create a new note.
 */
export const NewNoteButton: React.FC = () => {
  useTranslation()

  return (
    <Link href={'/new'} passHref={true}>
      <IconButton className='mx-2' iconSize={1.5} icon={IconPlus}>
        <Trans i18nKey='editor.appBar.new' />
      </IconButton>
    </Link>
  )
}
