/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { UserAvatarForUsername } from '../../../../../common/user-avatar/user-avatar-for-username'
import { SidebarMenuInfoEntry } from '../../../sidebar-menu-info-entry/sidebar-menu-info-entry'
import React, { useMemo } from 'react'
import { Pencil as IconPencil } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders an info line about the user that last updated the note content.
 */
export const NoteInfoLineUpdatedBy: React.FC = () => {
  useTranslation()
  const noteUpdateUser = useApplicationState((state) => state.noteDetails?.updateUsername)

  const userBlock = useMemo(() => {
    if (!noteUpdateUser) {
      return <Trans i18nKey={'common.guestUser'} />
    }
    return (
      <UserAvatarForUsername username={noteUpdateUser} additionalClasses={'font-style-normal bold font-weight-bold'} />
    )
  }, [noteUpdateUser])

  return (
    <SidebarMenuInfoEntry titleI18nKey={'editor.noteInfo.lastUpdatedBy'} icon={IconPencil}>
      {userBlock}
    </SidebarMenuInfoEntry>
  )
}
