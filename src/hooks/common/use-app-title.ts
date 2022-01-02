/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'
import { useApplicationState } from './use-application-state'

/**
 * Returns the app title with branding if set.
 */
export const useAppTitle = (): string => {
  const brandingName = useApplicationState((state) => state.config.branding.name)

  return useMemo(() => {
    return 'HedgeDoc' + (brandingName ? ` @ ${brandingName}` : '')
  }, [brandingName])
}
