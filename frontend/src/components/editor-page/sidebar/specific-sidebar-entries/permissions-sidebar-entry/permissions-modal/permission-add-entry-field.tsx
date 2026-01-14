/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useLowercaseOnInputChange } from '../../../../../../hooks/common/use-lowercase-on-input-change'
import { useTranslatedText } from '../../../../../../hooks/common/use-translated-text'
import { UiIcon } from '../../../../../common/icons/ui-icon'
import type { PermissionDisabledProps } from './permission-disabled.prop'
import React, { useCallback, useState } from 'react'
import { Button, FormControl, InputGroup } from 'react-bootstrap'
import { PlusLg as IconPlus } from 'react-bootstrap-icons'
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { useUiNotifications } from '../../../../../notifications/ui-notification-boundary'
import { setUserPermission } from '../../../../../../api/permissions'
import { setNotePermissionsFromServer } from '../../../../../../redux/note-details/methods'

export interface PermissionAddEntryFieldProps {
  i18nKey: string
}

/**
 * Permission entry row containing a field for adding new user permission entries.
 *
 * @param i18nKey The localization key for the submit button.
 * @param disabled If the user is not the owner, functionality is disabled.
 */
export const PermissionAddEntryField: React.FC<PermissionAddEntryFieldProps & PermissionDisabledProps> = ({
  i18nKey,
  disabled
}) => {
  const [newEntryIdentifier, setNewEntryIdentifier] = useState('')
  const onChange = useLowercaseOnInputChange(setNewEntryIdentifier)
  const noteAlias = useApplicationState((state) => state.noteDetails?.primaryAlias)
  const { showErrorNotification } = useUiNotifications()

  const onAddEntry = useCallback(() => {
    if (!noteAlias) {
      return
    }
    setUserPermission(noteAlias, newEntryIdentifier, false)
      .then((updatedPermissions) => {
        setNotePermissionsFromServer(updatedPermissions)
        setNewEntryIdentifier('')
      })
      .catch(showErrorNotification('editor.modal.permissions.error'))
  }, [noteAlias, newEntryIdentifier, showErrorNotification])

  const placeholderText = useTranslatedText(i18nKey)

  return (
    <li className={'list-group-item'}>
      <InputGroup className={'me-1 mb-1'}>
        <FormControl value={newEntryIdentifier} placeholder={placeholderText} onChange={onChange} disabled={disabled} />
        <Button
          variant='primary'
          className={'text-ms-2'}
          title={placeholderText}
          onClick={onAddEntry}
          disabled={disabled}>
          <UiIcon icon={IconPlus} />
        </Button>
      </InputGroup>
    </li>
  )
}
