/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment } from 'react'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { UserAvatarForUsername } from '../../../common/user-avatar/user-avatar-for-username'

export interface PermissionOwnerInfoProps {
  onEditOwner: () => void
}

/**
 * Content for the owner section of the permission modal that shows the current note owner.
 *
 * @param onEditOwner Callback that is fired when the user chooses to change the note owner.
 */
export const PermissionOwnerInfo: React.FC<PermissionOwnerInfoProps> = ({ onEditOwner }) => {
  const { t } = useTranslation()
  const noteOwner = useApplicationState((state) => state.noteDetails.permissions.owner)

  return (
    <Fragment>
      <UserAvatarForUsername username={noteOwner} />
      <Button variant='light' title={t('editor.modal.permissions.ownerChange.button')} onClick={onEditOwner}>
        <ForkAwesomeIcon icon={'pencil'} />
      </Button>
    </Fragment>
  )
}
