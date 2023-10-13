/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setNoteOwner } from '../../../../../../api/permissions'
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { setNotePermissionsFromServer } from '../../../../../../redux/note-details/methods'
import { useUiNotifications } from '../../../../../notifications/ui-notification-boundary'
import type { PermissionDisabledProps } from './permission-disabled.prop'
import { PermissionOwnerChange } from './permission-owner-change'
import { PermissionOwnerInfo } from './permission-owner-info'
import React, { Fragment, useCallback, useState } from 'react'
import { Trans } from 'react-i18next'
import { cypressId } from '../../../../../../utils/cypress-attribute'

/**
 * Section in the permissions modal for managing the owner of a note.
 *
 * @param disabled If the user is not the owner, functionality is disabled.
 */
export const PermissionSectionOwner: React.FC<PermissionDisabledProps> = ({ disabled }) => {
  const noteId = useApplicationState((state) => state.noteDetails?.id)
  const [changeOwner, setChangeOwner] = useState(false)
  const { showErrorNotification } = useUiNotifications()

  const onSetChangeOwner = useCallback(() => {
    setChangeOwner(true)
  }, [])

  const onOwnerChange = useCallback(
    (newOwner: string) => {
      if (!noteId) {
        return
      }
      setNoteOwner(noteId, newOwner)
        .then((updatedPermissions) => {
          setNotePermissionsFromServer(updatedPermissions)
        })
        .catch(showErrorNotification('editor.modal.permissions.ownerChange.error'))
        .finally(() => {
          setChangeOwner(false)
        })
    },
    [noteId, showErrorNotification]
  )

  return (
    <Fragment>
      <h5 className={'mb-3'}>
        <Trans i18nKey={'editor.modal.permissions.owner'} />
      </h5>
      <ul className={'list-group'}>
        <li
          className={'list-group-item d-flex flex-row align-items-center justify-content-between'}
          {...cypressId('permission-owner-name')}>
          {changeOwner ? (
            <PermissionOwnerChange onConfirmOwnerChange={onOwnerChange} />
          ) : (
            <PermissionOwnerInfo onEditOwner={onSetChangeOwner} disabled={disabled} />
          )}
        </li>
      </ul>
    </Fragment>
  )
}
