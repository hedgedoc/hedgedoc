/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useFrontendConfig } from '../../components/common/frontend-config-context/use-frontend-config'
import { useMemo } from 'react'

/**
 * Calculates the app title with branding if set.
 *
 * @return The app title with branding.
 */
export const useAppTitle = (): string => {
  const brandingName = useFrontendConfig().branding.name

  return useMemo(() => {
    return 'HedgeDoc' + (brandingName ? ` @ ${brandingName}` : '')
  }, [brandingName])
}
