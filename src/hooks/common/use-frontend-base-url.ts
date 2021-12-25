/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useRouter } from 'next/router'
import { useMemo } from 'react'

export const useFrontendBaseUrl = (): string => {
  const { asPath } = useRouter()
  return useMemo(() => {
    return process.env.NEXT_PUBLIC_FRONTEND_ASSETS_URL || window.location.toString().replace(asPath, '') + '/'
  }, [asPath])
}
