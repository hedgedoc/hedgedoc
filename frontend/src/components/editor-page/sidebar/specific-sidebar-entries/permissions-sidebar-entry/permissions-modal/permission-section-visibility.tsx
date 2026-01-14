/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setNotePublic } from '../../../../../../api/permissions'
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { setNotePermissionsFromServer } from '../../../../../../redux/note-details/methods'
import { useUiNotifications } from '../../../../../notifications/ui-notification-boundary'
import type { PermissionDisabledProps } from './permission-disabled.prop'
import React, { type ChangeEvent, Fragment, useCallback } from 'react'
import { Trans } from 'react-i18next'
import { Form } from 'react-bootstrap'

/**
 * Section in the permissions modal for managing whether the note should be visible on the explore page.
 *
 * @param disabled If the user is not the owner, functionality is disabled.
 */
export const PermissionSectionVisibility: React.FC<PermissionDisabledProps> = ({ disabled }) => {
  const noteAlias = useApplicationState((state) => state.noteDetails?.primaryAlias)
  const currentVisibility = useApplicationState((state) => state.noteDetails.permissions.publiclyVisible)
  const { showErrorNotificationBuilder } = useUiNotifications()

  const onSetChangeVisibility = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!noteAlias) {
        return
      }
      const newValue = event.target.checked
      setNotePublic(noteAlias, newValue)
        .then((updatedPermissions) => {
          setNotePermissionsFromServer(updatedPermissions)
        })
        .catch(showErrorNotificationBuilder('editor.modal.permissions.error'))
    },
    [noteAlias, showErrorNotificationBuilder]
  )

  return (
    <Fragment>
      <h5 className={'my-3'}>
        <Trans i18nKey={'editor.modal.permissions.visibility'} />
      </h5>
      <ul className={'list-group'}>
        <li className={'list-group-item'}>
          <Form.Check
            disabled={disabled}
            reverse={true}
            type={'switch'}
            className={'d-flex flex-row align-items-center justify-content-between'}>
            <Form.Check.Label>
              <Trans i18nKey={'editor.modal.permissions.publiclyVisible'} />
            </Form.Check.Label>
            <Form.Check.Input disabled={disabled} onChange={onSetChangeVisibility} checked={currentVisibility} />
          </Form.Check>
        </li>
      </ul>
    </Fragment>
  )
}
