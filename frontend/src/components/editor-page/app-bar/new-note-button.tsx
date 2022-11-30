/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import Link from 'next/link'
import React from 'react'
import { Button } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders a button to create a new note.
 */
export const NewNoteButton: React.FC = () => {
  useTranslation()

  return (
    <Link href={'/new'} passHref={true}>
      <Button className='mx-2' size='sm' variant='primary'>
        <ForkAwesomeIcon icon='plus' /> <Trans i18nKey='editor.appBar.new' />
      </Button>
    </Link>
  )
}
