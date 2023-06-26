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
import { FileEarmarkTextFill as IconFileEarmarkTextFill } from 'react-bootstrap-icons'

/**
 * Button that links to the read-only version of a note.
 */
export const ReadOnlyModeButton: React.FC = () => {
  const noteIdentifier = useApplicationState((state) => state.noteDetails.primaryAddress)
  const buttonVariant = useOutlineButtonVariant()
  const buttonTitle = useTranslatedText('editor.documentBar.readOnlyMode')

  return (
    <Link href={`/s/${noteIdentifier}`} target='_blank'>
      <Button title={buttonTitle} size='sm' variant={buttonVariant}>
        <UiIcon icon={IconFileEarmarkTextFill} />
      </Button>
    </Link>
  )
}
