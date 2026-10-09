/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useIsOwner } from '../../../../../hooks/common/use-is-owner'
import type { PermissionDisabledProps } from './permission-disabled.prop'
import { PermissionEntrySpecialGroup } from './permission-entry-special-group'
import { PermissionLevel, SpecialGroup } from '@hedgedoc/commons'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetSpecialPermissions } from './hooks/use-get-special-permissions'
import { SidebarMenuInfoEntry } from '../../sidebar-menu-info-entry/sidebar-menu-info-entry'
import { PeopleFill as IconPeopleFill } from 'react-bootstrap-icons'

/**
 * Section of the permission modal for managing special group access to the note.
 *
 * @param disabled If the user is not the owner, functionality is disabled.
 */
export const PermissionSectionSpecialGroups: React.FC<PermissionDisabledProps> = ({ disabled }) => {
  useTranslation()
  const isOwner = useIsOwner()
  const { [SpecialGroup.EVERYONE]: groupEveryone, [SpecialGroup.LOGGED_IN]: groupLoggedIn } = useGetSpecialPermissions()

  const specialGroupEntries = useMemo(() => {
    return {
      everyoneLevel: groupEveryone
        ? groupEveryone.canEdit
          ? PermissionLevel.WRITE
          : PermissionLevel.READ
        : PermissionLevel.DENY,
      loggedInLevel: groupLoggedIn
        ? groupLoggedIn.canEdit
          ? PermissionLevel.WRITE
          : PermissionLevel.READ
        : PermissionLevel.DENY,
      loggedInInconsistentAlert: groupEveryone && (!groupLoggedIn || (groupEveryone.canEdit && !groupLoggedIn.canEdit))
    }
  }, [groupEveryone, groupLoggedIn])

  return (
    <SidebarMenuInfoEntry titleI18nKey={'editor.permissions.sharedWithGroups'} icon={IconPeopleFill}>
      <PermissionEntrySpecialGroup
        level={specialGroupEntries.loggedInLevel}
        type={SpecialGroup.LOGGED_IN}
        disabled={!isOwner}
        inconsistent={specialGroupEntries.loggedInInconsistentAlert}
      />
      <PermissionEntrySpecialGroup
        level={specialGroupEntries.everyoneLevel}
        type={SpecialGroup.EVERYONE}
        disabled={disabled}
      />
    </SidebarMenuInfoEntry>
  )
}
