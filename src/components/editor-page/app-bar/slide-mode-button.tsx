/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Button } from 'react-bootstrap'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { useTranslation } from 'react-i18next'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import Link from 'next/link'

/**
 * Button that links to the slide-show presentation of the current note.
 */
export const SlideModeButton: React.FC = () => {
  const { t } = useTranslation()
  const noteIdentifier = useApplicationState((state) => state.noteDetails.primaryAddress)

  return (
    <Link href={`/p/${noteIdentifier}`}>
      <a target='_blank'>
        <Button
          title={t('editor.documentBar.slideMode')}
          className='ms-2 text-secondary'
          size='sm'
          variant='outline-light'>
          <ForkAwesomeIcon icon='television' />
        </Button>
      </a>
    </Link>
  )
}
