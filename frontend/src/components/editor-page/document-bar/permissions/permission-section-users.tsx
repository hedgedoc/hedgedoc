/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment, useCallback, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { PermissionEntryUser } from './permission-entry-user'
import { PermissionAddEntryField } from './permission-add-entry-field'
import { setUserPermission } from '../../../../api/permissions'
import { setNotePermissionsFromServer } from '../../../../redux/note-details/methods'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'

/**
 * Section of the permission modal for managing user access to the note.
 */
export const PermissionSectionUsers: React.FC = () => {
  useTranslation()
  const userPermissions = useApplicationState((state) => state.noteDetails.permissions.sharedToUsers)
  const noteId = useApplicationState((state) => state.noteDetails.primaryAddress)
  const { showErrorNotification } = useUiNotifications()

  const userEntries = useMemo(() => {
    return userPermissions.map((entry) => <PermissionEntryUser key={entry.username} entry={entry} />)
  }, [userPermissions])

  const onAddEntry = useCallback(
    (username: string) => {
      setUserPermission(noteId, username, false)
        .then((updatedPermissions) => {
          setNotePermissionsFromServer(updatedPermissions)
        })
        .catch(showErrorNotification('editor.modal.permissions.error'))
    },
    [noteId, showErrorNotification]
  )

  return (
    <Fragment>
      <h5 className={'my-3'}>
        <Trans i18nKey={'editor.modal.permissions.sharedWithUsers'} />
      </h5>
      <ul className={'list-group'}>
        {userEntries}
        <PermissionAddEntryField onAddEntry={onAddEntry} i18nKey={'editor.modal.permissions.addUser'} />
      </ul>
    </Fragment>
  )
}
