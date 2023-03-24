/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from './use-application-state'
import { useMemo } from 'react'

/**
 * Determines if the current user is the owner of the current note.
 *
 * @return True, if the current user is owner.
 */
export const useIsOwner = (): boolean => {
  const owner = useApplicationState((state) => state.noteDetails.permissions.owner)
  const me: string | undefined = useApplicationState((state) => state.user?.username)

  return useMemo(() => !!me && owner === me, [owner, me])
}
