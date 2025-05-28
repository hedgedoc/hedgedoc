/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from './use-application-state'
import { AuthProviderType } from '@hedgedoc/commons'

/**
 * Hook to check if currently a user is logged in.
 * @return True, if a user is logged in. False otherwise.
 */
export const useIsLoggedIn = () => {
  return useApplicationState((state) => state.user !== null && state.user.authProvider !== AuthProviderType.GUEST)
}
