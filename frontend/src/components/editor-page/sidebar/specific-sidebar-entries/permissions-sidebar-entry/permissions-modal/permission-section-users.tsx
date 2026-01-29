/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { PermissionAddEntryField } from './permission-add-entry-field'
import type { PermissionDisabledProps } from './permission-disabled.prop'
import { PermissionEntryUser } from './permission-entry-user'
import React, { Fragment, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Section of the permission modal for managing user access to the note.
 *
 * @param disabled If the user is not the owner, functionality is disabled.
 */
export const PermissionSectionUsers: React.FC<PermissionDisabledProps> = ({ disabled }) => {
  useTranslation()
  const userPermissions = useApplicationState((state) => state.noteDetails?.permissions.sharedToUsers)

  const userEntries = useMemo(() => {
    if (!userPermissions) {
      return null
    }
    return userPermissions.map((entry) => (
      <PermissionEntryUser key={entry.username} entry={entry} disabled={disabled} />
    ))
  }, [userPermissions, disabled])

  return (
    <Fragment>
      <h5 className={'my-3'}>
        <Trans i18nKey={'editor.modal.permissions.sharedWithUsers'} />
      </h5>
      <ul className={'list-group'}>
        {userEntries}
        <PermissionAddEntryField i18nKey={'editor.modal.permissions.addUser'} disabled={disabled} />
      </ul>
    </Fragment>
  )
}
