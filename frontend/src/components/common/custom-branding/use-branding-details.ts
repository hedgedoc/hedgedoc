/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { BrandingDto } from '@hedgedoc/commons'
import { useFrontendConfig } from '../frontend-config-context/use-frontend-config'
import { useMemo } from 'react'

/**
 * Extracts the branding from the config.
 *
 * @return the branding configuration or null if no branding has been configured
 */
export const useBrandingDetails = (): null | BrandingDto => {
  const branding = useFrontendConfig().branding

  return useMemo(() => {
    return branding.name === null && branding.logo === null ? null : branding
  }, [branding])
}
