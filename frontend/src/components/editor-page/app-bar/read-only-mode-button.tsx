/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import Link from 'next/link'
import React from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

/**
 * Button that links to the read-only version of a note.
 */
export const ReadOnlyModeButton: React.FC = () => {
  const { t } = useTranslation()
  const noteIdentifier = useApplicationState((state) => state.noteDetails.primaryAddress)

  return (
    <Link href={`/s/${noteIdentifier}`}>
      <a target='_blank'>
        <Button
          title={t('editor.documentBar.readOnlyMode') ?? undefined}
          className='ms-2 text-secondary'
          size='sm'
          variant='outline-light'>
          <ForkAwesomeIcon icon='file-text-o' />
        </Button>
      </a>
    </Link>
  )
}
