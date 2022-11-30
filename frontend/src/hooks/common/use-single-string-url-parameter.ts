/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useRouter } from 'next/router'
import { useMemo } from 'react'

/**
 * Extracts the parameter from the router expected to be a single value.
 *
 * @param parameter The parameter to extract
 * @param fallback The fallback returned if there is no value.
 * @return A value extracted from the router.
 */
export const useSingleStringUrlParameter = <T>(parameter: string, fallback: T): string | T => {
  const router = useRouter()

  return useMemo(() => {
    const value = router.query[parameter]
    return (typeof value === 'string' ? value : value?.[0]) ?? fallback
  }, [fallback, parameter, router.query])
}
