/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { PermissionEntrySpecialGroup } from './permission-entry-special-group'
import { AccessLevel, SpecialGroup } from './types'

/**
 * Section of the permission modal for managing special group access to the note.
 */
export const PermissionSectionSpecialGroups: React.FC = () => {
  useTranslation()
  const groupPermissions = useApplicationState((state) => state.noteDetails.permissions.sharedToGroups)

  const specialGroupEntries = useMemo(() => {
    const groupEveryone = groupPermissions.find((entry) => entry.groupName === SpecialGroup.EVERYONE)
    const groupLoggedIn = groupPermissions.find((entry) => entry.groupName === SpecialGroup.LOGGED_IN)

    return {
      everyone: groupEveryone
        ? groupEveryone.canEdit
          ? AccessLevel.WRITEABLE
          : AccessLevel.READ_ONLY
        : AccessLevel.NONE,
      loggedIn: groupLoggedIn
        ? groupLoggedIn.canEdit
          ? AccessLevel.WRITEABLE
          : AccessLevel.READ_ONLY
        : AccessLevel.NONE
    }
  }, [groupPermissions])

  return (
    <Fragment>
      <h5 className={'my-3'}>
        <Trans i18nKey={'editor.modal.permissions.sharedWithElse'} />
      </h5>
      <ul className={'list-group'}>
        <PermissionEntrySpecialGroup level={specialGroupEntries.loggedIn} type={SpecialGroup.LOGGED_IN} />
        <PermissionEntrySpecialGroup level={specialGroupEntries.everyone} type={SpecialGroup.EVERYONE} />
      </ul>
    </Fragment>
  )
}
