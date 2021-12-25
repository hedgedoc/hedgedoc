/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useRouter } from 'next/router'
import { useMemo } from 'react'

export const useSingleStringUrlParameter = <T>(parameter: string, fallback: T): string | T => {
  const router = useRouter()

  return useMemo(() => {
    const value = router.query[parameter]
    return (typeof value === 'string' ? value : value?.[0]) ?? fallback
  }, [fallback, parameter, router.query])
}
