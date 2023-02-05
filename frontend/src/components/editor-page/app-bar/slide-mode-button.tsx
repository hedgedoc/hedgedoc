/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { UiIcon } from '../../common/icons/ui-icon'
import Link from 'next/link'
import React from 'react'
import { Button } from 'react-bootstrap'
import { Tv as IconTv } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

/**
 * Button that links to the slide-show presentation of the current note.
 */
export const SlideModeButton: React.FC = () => {
  const { t } = useTranslation()
  const noteIdentifier = useApplicationState((state) => state.noteDetails.primaryAddress)

  return (
    <Link href={`/p/${noteIdentifier}`} target='_blank'>
      <Button
        title={t('editor.documentBar.slideMode') ?? undefined}
        className='ms-2 text-secondary'
        size='sm'
        variant='outline-light'>
        <UiIcon icon={IconTv} />
      </Button>
    </Link>
  )
}
