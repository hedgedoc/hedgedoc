/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { TimeFromNow } from '../../../../../common/time-from-now'
import { SidebarMenuInfoEntry } from '../../../sidebar-menu-info-entry/sidebar-menu-info-entry'
import { DateTime } from 'luxon'
import React, { useMemo } from 'react'
import { Plus as IconPlus } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

/**
 * Renders an info line about the creation time of the current note.
 */
export const NoteInfoLineCreatedAt: React.FC = () => {
  useTranslation()
  const noteCreateTime = useApplicationState((state) => state.noteDetails?.createdAt)
  const noteCreateDateTime = useMemo(
    () => (noteCreateTime === undefined ? null : DateTime.fromSeconds(noteCreateTime)),
    [noteCreateTime]
  )

  return !noteCreateDateTime ? null : (
    <SidebarMenuInfoEntry titleI18nKey={'editor.noteInfo.created'} icon={IconPlus}>
      <TimeFromNow time={noteCreateDateTime} />
    </SidebarMenuInfoEntry>
  )
}
