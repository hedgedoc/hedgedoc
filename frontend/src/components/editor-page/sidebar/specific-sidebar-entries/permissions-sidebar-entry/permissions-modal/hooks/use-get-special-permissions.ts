/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../../../hooks/common/use-application-state'
import { useMemo } from 'react'
import { SpecialGroup } from '@hedgedoc/commons'

/**
 * Returns the special permissions for the current note.
 * @return A memoized object containing the special permissions for the current note.
 */
export const useGetSpecialPermissions = () => {
  const groupPermissions = useApplicationState((state) => state.noteDetails?.permissions.sharedToGroups)
  return useMemo(() => {
    const everyone = groupPermissions?.find((group) => group.groupName === (SpecialGroup.EVERYONE as string))
    const loggedIn = groupPermissions?.find((group) => group.groupName === (SpecialGroup.LOGGED_IN as string))
    return {
      [SpecialGroup.EVERYONE]: everyone,
      [SpecialGroup.LOGGED_IN]: loggedIn
    }
  }, [groupPermissions])
}
