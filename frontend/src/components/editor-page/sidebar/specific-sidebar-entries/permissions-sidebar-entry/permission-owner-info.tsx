/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../../../hooks/common/use-translated-text'
import { UiIcon } from '../../../../common/icons/ui-icon'
import { UserAvatarForUsername } from '../../../../common/user-avatar/user-avatar-for-username'
import type { PermissionDisabledProps } from './permission-disabled.prop'
import React, { Fragment } from 'react'
import { Button } from 'react-bootstrap'
import { Pencil as IconPencil } from 'react-bootstrap-icons'
import { GuestUserAvatar } from '../../../../common/user-avatar/guest-user-avatar'

export interface PermissionOwnerInfoProps {
  noteOwner: string | null
  onEditOwner: () => void
}

/**
 * Content for the owner section of the permission modal that shows the current note owner.
 *
 * @param noteOwner The owner of the note or undefined if a guest user is used.
 * @param onEditOwner Callback that is fired when the user chooses to change the note owner.
 * @param disabled If the user is not the owner, functionality is disabled.
 */
export const PermissionOwnerInfo: React.FC<PermissionOwnerInfoProps & PermissionDisabledProps> = ({
  noteOwner,
  onEditOwner,
  disabled
}) => {
  const buttonTitle = useTranslatedText('editor.permissions.ownerChange.button')

  if (!noteOwner) {
    return <GuestUserAvatar photoComponent={false} />
  }

  return (
    <Fragment>
      <UserAvatarForUsername username={noteOwner} photoComponent={false} />
      <Button variant='primary' disabled={disabled} title={buttonTitle} onClick={onEditOwner}>
        <UiIcon icon={IconPencil} />
      </Button>
    </Fragment>
  )
}
