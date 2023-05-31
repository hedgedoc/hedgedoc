/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { useOutlineButtonVariant } from '../../../hooks/dark-mode/use-outline-button-variant'
import { UiIcon } from '../../common/icons/ui-icon'
import Link from 'next/link'
import React from 'react'
import { Button } from 'react-bootstrap'
import { FileEarmarkTextFill as IconFileEarmarkTextFill } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

/**
 * Button that links to the read-only version of a note.
 */
export const ReadOnlyModeButton: React.FC = () => {
  const { t } = useTranslation()
  const noteIdentifier = useApplicationState((state) => state.noteDetails.primaryAddress)
  const buttonVariant = useOutlineButtonVariant()

  return (
    <Link href={`/s/${noteIdentifier}`} target='_blank'>
      <Button title={t('editor.documentBar.readOnlyMode') ?? undefined} size='sm' variant={buttonVariant}>
        <UiIcon icon={IconFileEarmarkTextFill} />
      </Button>
    </Link>
  )
}
