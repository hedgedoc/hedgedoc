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
import { Save as IconSave } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

/**
 * Renders an info line about the time that the note content was last updated.
 */
export const NoteInfoLineUpdatedAt: React.FC = () => {
  useTranslation()
  const noteUpdateTime = useApplicationState((state) => state.noteDetails?.updatedAt)
  const noteUpdateDateTime = useMemo(
    () => (noteUpdateTime === undefined ? null : DateTime.fromSeconds(noteUpdateTime)),
    [noteUpdateTime]
  )

  return !noteUpdateDateTime ? null : (
    <SidebarMenuInfoEntry titleI18nKey={'editor.noteInfo.lastUpdated'} icon={IconSave}>
      <TimeFromNow time={noteUpdateDateTime} />
    </SidebarMenuInfoEntry>
  )
}
