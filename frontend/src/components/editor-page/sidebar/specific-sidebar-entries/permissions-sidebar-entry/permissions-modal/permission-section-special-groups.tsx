/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { useIsOwner } from '../../../../../../hooks/common/use-is-owner'
import type { PermissionDisabledProps } from './permission-disabled.prop'
import { PermissionEntrySpecialGroup } from './permission-entry-special-group'
import { AccessLevel, SpecialGroup } from '@hedgedoc/commons'
import React, { Fragment, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Section of the permission modal for managing special group access to the note.
 *
 * @param disabled If the user is not the owner, functionality is disabled.
 */
export const PermissionSectionSpecialGroups: React.FC<PermissionDisabledProps> = ({ disabled }) => {
  useTranslation()
  const groupPermissions = useApplicationState((state) => state.noteDetails?.permissions.sharedToGroups)
  const isOwner = useIsOwner()

  const specialGroupEntries = useMemo(() => {
    if (!groupPermissions) {
      return
    }
    const groupEveryone = groupPermissions.find((entry) => entry.groupName === (SpecialGroup.EVERYONE as string))
    const groupLoggedIn = groupPermissions.find((entry) => entry.groupName === (SpecialGroup.LOGGED_IN as string))

    return {
      everyoneLevel: groupEveryone
        ? groupEveryone.canEdit
          ? AccessLevel.WRITEABLE
          : AccessLevel.READ_ONLY
        : AccessLevel.NONE,
      loggedInLevel: groupLoggedIn
        ? groupLoggedIn.canEdit
          ? AccessLevel.WRITEABLE
          : AccessLevel.READ_ONLY
        : AccessLevel.NONE,
      loggedInInconsistentAlert: groupEveryone && (!groupLoggedIn || (groupEveryone.canEdit && !groupLoggedIn.canEdit))
    }
  }, [groupPermissions])

  if (!specialGroupEntries) {
    return null
  }

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
