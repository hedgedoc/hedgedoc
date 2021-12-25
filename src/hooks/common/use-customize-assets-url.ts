/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useBackendBaseUrl } from './use-backend-base-url'

export const useCustomizeAssetsUrl = (): string => {
  const backendBaseUrl = useBackendBaseUrl()
  return process.env.NEXT_PUBLIC_CUSTOMIZE_ASSETS_URL || `${backendBaseUrl}public/`
}
