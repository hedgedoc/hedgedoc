/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setNotePublic } from '../../../../../api/permissions'
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { setNotePermissionsFromServer } from '../../../../../redux/note-details/methods'
import { useUiNotifications } from '../../../../notifications/ui-notification-boundary'
import type { PermissionDisabledProps } from './permission-disabled.prop'
import React, { type ChangeEvent, useCallback } from 'react'
import { Trans } from 'react-i18next'
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { ErrorToI18nKeyMapper } from '../../../../../api/common/error-to-i18n-key-mapper'
import { SidebarMenuInfoEntry } from '../../sidebar-menu-info-entry/sidebar-menu-info-entry'
import { Eye as IconEye } from 'react-bootstrap-icons'

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
        .catch((error) => {
          const errorI18nKey = new ErrorToI18nKeyMapper(error, 'editor.permissions.error')
            .withHttpCode(403, 'missingPermissions')
            .orFallbackI18nKey('other')
          showErrorNotificationBuilder(errorI18nKey)(error)
        })
    },
    [noteAlias, showErrorNotificationBuilder]
  )

  return (
    <SidebarMenuInfoEntry titleI18nKey={'editor.permissions.visibility'} icon={IconEye}>
      <OverlayTrigger
        placement='bottom'
        delay={{ show: 250, hide: 400 }}
        overlay={
          <Tooltip id='publiclyVisibleExplanation'>
            <Trans i18nKey={'editor.permissions.publiclyVisibleExplanation'} />
          </Tooltip>
        }>
        {({ ref, ...triggerHandler }) => (
          <Form.Check
            disabled={disabled}
            reverse={true}
            type={'switch'}
            className={'d-flex flex-row align-items-center justify-content-between'}>
            <Form.Check.Label>
              <Trans i18nKey={'editor.permissions.publiclyVisible'} />
            </Form.Check.Label>
            <Form.Check.Input
              disabled={disabled}
              onChange={onSetChangeVisibility}
              checked={currentVisibility}
              ref={ref}
              {...triggerHandler}
            />
          </Form.Check>
        )}
      </OverlayTrigger>
    </SidebarMenuInfoEntry>
  )
}
