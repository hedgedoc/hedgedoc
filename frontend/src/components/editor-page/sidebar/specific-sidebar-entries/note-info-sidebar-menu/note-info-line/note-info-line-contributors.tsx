/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { SidebarMenuInfoEntry } from '../../../sidebar-menu-info-entry/sidebar-menu-info-entry'
import React from 'react'
import { People as IconPeople } from 'react-bootstrap-icons'

/**
 * Renders an info line about the number of contributors for the note.
 */
export const NoteInfoLineContributors: React.FC = () => {
  const contributors = useApplicationState((state) => state.noteDetails?.editedBy.length ?? 0)

  return (
    <SidebarMenuInfoEntry titleI18nKey={'editor.noteInfo.contributors'} icon={IconPeople}>
      {contributors}
    </SidebarMenuInfoEntry>
  )
}
