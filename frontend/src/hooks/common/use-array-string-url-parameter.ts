/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

/**
 * Extracts the parameter from the router expected to be an array of values.
 *
 * @param parameter The parameter to extract
 * @return An array of values extracted from the router.
 */
export const useArrayStringUrlParameter = (parameter: string): string[] => {
  const router = useSearchParams()

  return useMemo(() => {
    return router?.getAll(parameter) ?? []
  }, [parameter, router])
}
