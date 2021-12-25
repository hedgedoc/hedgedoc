/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useRouter } from 'next/router'
import { useMemo } from 'react'

export const useArrayStringUrlParameter = (parameter: string): string[] => {
  const router = useRouter()

  return useMemo(() => {
    const value = router.query[parameter]
    return (typeof value === 'string' ? [value] : value) ?? []
  }, [parameter, router.query])
}
