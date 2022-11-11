/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'
import { useApplicationState } from './use-application-state'

/**
 * Calculates the app title with branding if set.
 *
 * @return The app title with branding.
 */
export const useAppTitle = (): string => {
  const brandingName = useApplicationState((state) => state.config.branding.name)

  return useMemo(() => {
    return 'HedgeDoc' + (brandingName ? ` @ ${brandingName}` : '')
  }, [brandingName])
}
