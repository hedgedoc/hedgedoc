/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from './use-application-state'
import { userIsOwner } from '@hedgedoc/commons'
import { useMemo } from 'react'

/**
 * Determines if the current user is the owner of the current note.
 *
 * @return True, if the current user is owner.
 */
export const useIsOwner = (): boolean => {
  const me: string | undefined = useApplicationState((state) => state.user?.username)
  const permissions = useApplicationState((state) => state.noteDetails?.permissions)

  return useMemo(() => (permissions === undefined ? false : userIsOwner(permissions, me)), [permissions, me])
}
