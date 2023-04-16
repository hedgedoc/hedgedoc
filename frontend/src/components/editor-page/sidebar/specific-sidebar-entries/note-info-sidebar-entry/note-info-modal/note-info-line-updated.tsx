/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { UserAvatarForUsername } from '../../../../../common/user-avatar/user-avatar-for-username'
import { NoteInfoLine } from './note-info-line'
import type { NoteInfoTimeLineProps } from './note-info-time-line'
import { UnitalicBoldTimeFromNow } from './utils/unitalic-bold-time-from-now'
import { UnitalicBoldTrans } from './utils/unitalic-bold-trans'
import { DateTime } from 'luxon'
import React, { useMemo } from 'react'
import { Pencil as IconPencil } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders an info line about the last update of the current note.
 *
 * @param size The size in which line and user avatar should be displayed.
 */
export const NoteInfoLineUpdated: React.FC<NoteInfoTimeLineProps> = ({ size }) => {
  useTranslation()
  const noteUpdateTime = useApplicationState((state) => state.noteDetails.updatedAt)
  const noteUpdateDateTime = useMemo(() => DateTime.fromSeconds(noteUpdateTime), [noteUpdateTime])
  const noteUpdateUser = useApplicationState((state) => state.noteDetails.updateUsername)

  const userBlock = useMemo(() => {
    if (!noteUpdateUser) {
      return <UnitalicBoldTrans i18nKey={'common.guestUser'} />
    }
    return (
      <UserAvatarForUsername
        username={noteUpdateUser}
        additionalClasses={'font-style-normal bold font-weight-bold'}
        size={size ? 'lg' : undefined}
      />
    )
  }, [noteUpdateUser, size])

  return (
    <NoteInfoLine icon={IconPencil} size={size}>
      <Trans i18nKey={'editor.modal.documentInfo.edited'}>
        {userBlock}
        <UnitalicBoldTimeFromNow time={noteUpdateDateTime} />
      </Trans>
    </NoteInfoLine>
  )
}
