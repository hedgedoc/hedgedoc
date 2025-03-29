/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useIsOwner } from '../../../../../../hooks/common/use-is-owner'
import type { PermissionDisabledProps } from './permission-disabled.prop'
import { PermissionEntrySpecialGroup } from './permission-entry-special-group'
import { GuestAccess, SpecialGroup } from '@hedgedoc/commons'
import React, { Fragment, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useGetSpecialPermissions } from './hooks/use-get-special-permissions'

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
      everyoneLevel: groupEveryone ? (groupEveryone.canEdit ? GuestAccess.WRITE : GuestAccess.READ) : GuestAccess.DENY,
      loggedInLevel: groupLoggedIn ? (groupLoggedIn.canEdit ? GuestAccess.WRITE : GuestAccess.READ) : GuestAccess.DENY,
      loggedInInconsistentAlert: groupEveryone && (!groupLoggedIn || (groupEveryone.canEdit && !groupLoggedIn.canEdit))
    }
  }, [groupEveryone, groupLoggedIn])

  return (
    <Fragment>
      <h5 className={'my-3'}>
        <Trans i18nKey={'editor.modal.permissions.sharedWithElse'} />
      </h5>
      <ul className={'list-group'}>
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
      </ul>
    </Fragment>
  )
}
