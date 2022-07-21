/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react'
import { Trans } from 'react-i18next'
import { NoteInfoLine } from './note-info-line'
import type { NoteInfoTimeLineProps } from './note-info-time-line'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { UnitalicBoldTimeFromNow } from './utils/unitalic-bold-time-from-now'
import { DateTime } from 'luxon'

/**
 * Renders an info line about the creation of the current note.
 *
 * @param size The size in which the line should be displayed.
 */
export const NoteInfoLineCreated: React.FC<NoteInfoTimeLineProps> = ({ size }) => {
  const noteCreateTime = useApplicationState((state) => state.noteDetails.createdAt)
  const noteCreateDateTime = useMemo(() => DateTime.fromSeconds(noteCreateTime), [noteCreateTime])

  return (
    <NoteInfoLine icon={'plus'} size={size}>
      <Trans i18nKey={'editor.modal.documentInfo.created'}>
        <UnitalicBoldTimeFromNow time={noteCreateDateTime} />
      </Trans>
    </NoteInfoLine>
  )
}
