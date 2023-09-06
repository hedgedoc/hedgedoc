/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from './use-application-state'
import { userCanEdit } from '@hedgedoc/commons'
import { useMemo } from 'react'

/**
 * Determines if the current user is allowed to write to this note.
 *
 * @return True, if the current user is allowed to write.
 */
export const useMayEdit = (): boolean => {
  const me: string | undefined = useApplicationState((state) => state.user?.username)
  const permissions = useApplicationState((state) => state.noteDetails?.permissions)

  return useMemo(() => (!permissions ? false : userCanEdit(permissions, me)), [permissions, me])
}
