/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import { useOutlineButtonVariant } from '../../../hooks/dark-mode/use-outline-button-variant'
import { UiIcon } from '../../common/icons/ui-icon'
import Link from 'next/link'
import React from 'react'
import { Button } from 'react-bootstrap'
import { Tv as IconTv } from 'react-bootstrap-icons'

/**
 * Button that links to the slide-show presentation of the current note.
 */
export const SlideModeButton: React.FC = () => {
  const noteIdentifier = useApplicationState((state) => state.noteDetails.primaryAddress)
  const buttonVariant = useOutlineButtonVariant()
  const buttonTitle = useTranslatedText('editor.documentBar.slideMode')

  return (
    <Link href={`/p/${noteIdentifier}`} target='_blank'>
      <Button title={buttonTitle} className='ms-2' size='sm' variant={buttonVariant}>
        <UiIcon icon={IconTv} />
      </Button>
    </Link>
  )
}
