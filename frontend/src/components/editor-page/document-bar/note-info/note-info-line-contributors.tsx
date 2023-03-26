/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useNoteDetails } from '../../../../hooks/common/use-note-details'
import { NoteInfoLine } from './note-info-line'
import { UnitalicBoldContent } from './unitalic-bold-content'
import React from 'react'
import { People as IconPeople } from 'react-bootstrap-icons'
import { Trans } from 'react-i18next'

/**
 * Renders an info line about the number of contributors for the note.
 */
export const NoteInfoLineContributors: React.FC = () => {
  const contributors = useNoteDetails().editedBy.length

  return (
    <NoteInfoLine icon={IconPeople} size={2}>
      <Trans i18nKey={'editor.modal.documentInfo.usersContributed'}>
        <UnitalicBoldContent text={contributors} />
      </Trans>
    </NoteInfoLine>
  )
}
