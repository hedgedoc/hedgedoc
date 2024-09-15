/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { useTranslatedText } from '../../../../../../hooks/common/use-translated-text'
import { UiIcon } from '../../../../../common/icons/ui-icon'
import { UserAvatarForUsername } from '../../../../../common/user-avatar/user-avatar-for-username'
import type { PermissionDisabledProps } from './permission-disabled.prop'
import React, { Fragment } from 'react'
import { Button } from 'react-bootstrap'
import { Pencil as IconPencil } from 'react-bootstrap-icons'
import { GuestUserAvatar } from '../../../../../common/user-avatar/guest-user-avatar'

export interface PermissionOwnerInfoProps {
  onEditOwner: () => void
}

/**
 * Content for the owner section of the permission modal that shows the current note owner.
 *
 * @param onEditOwner Callback that is fired when the user chooses to change the note owner.
 * @param disabled If the user is not the owner, functionality is disabled.
 */
export const PermissionOwnerInfo: React.FC<PermissionOwnerInfoProps & PermissionDisabledProps> = ({
  onEditOwner,
  disabled
}) => {
  const noteOwner = useApplicationState((state) => state.noteDetails?.permissions.owner)
  const buttonTitle = useTranslatedText('editor.modal.permissions.ownerChange.button')

  if (!noteOwner) {
    return <GuestUserAvatar />
  }

  return (
    <Fragment>
      <UserAvatarForUsername username={noteOwner} />
      <Button variant='primary' disabled={disabled} title={buttonTitle} onClick={onEditOwner}>
        <UiIcon icon={IconPencil} />
      </Button>
    </Fragment>
  )
}
