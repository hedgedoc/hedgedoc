/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useNoteDetails } from '../../../../hooks/common/use-note-details'
import { NoteInfoLine } from './note-info-line'
import type { NoteInfoTimeLineProps } from './note-info-time-line'
import { UnitalicBoldTimeFromNow } from './utils/unitalic-bold-time-from-now'
import { DateTime } from 'luxon'
import React, { useMemo } from 'react'
import { Plus as IconPlus } from 'react-bootstrap-icons'
import { Trans } from 'react-i18next'

/**
 * Renders an info line about the creation of the current note.
 *
 * @param size The size in which the line should be displayed.
 */
export const NoteInfoLineCreated: React.FC<NoteInfoTimeLineProps> = ({ size }) => {
  const noteCreateTime = useNoteDetails().createdAt
  const noteCreateDateTime = useMemo(() => DateTime.fromSeconds(noteCreateTime), [noteCreateTime])

  return (
    <NoteInfoLine icon={IconPlus} size={size}>
      <Trans i18nKey={'editor.modal.documentInfo.created'}>
        <UnitalicBoldTimeFromNow time={noteCreateDateTime} />
      </Trans>
    </NoteInfoLine>
  )
}
