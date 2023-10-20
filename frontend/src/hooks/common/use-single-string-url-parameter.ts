/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

/**
 * Extracts the parameter from the router expected to be a single value.
 *
 * @param parameter The parameter to extract
 * @param fallback The fallback returned if there is no value.
 * @return A value extracted from the router.
 */
export const useSingleStringUrlParameter = <T>(parameter: string, fallback: T): string | T => {
  const router = useSearchParams()

  const value = useMemo(() => router?.get(parameter) ?? null, [parameter, router])
  return value ?? fallback
}
