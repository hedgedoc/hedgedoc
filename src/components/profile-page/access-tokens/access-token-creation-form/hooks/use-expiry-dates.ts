/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'
import { DateTime } from 'luxon'

interface ExpiryDates {
  default: string
  min: string
  max: string
}

/**
 * Returns the minimal, maximal and default expiry date for new access tokens.
 *
 * @return Memoized expiry dates.
 */
export const useExpiryDates = (): ExpiryDates => {
  return useMemo(() => {
    const today = DateTime.now()
    return {
      min: today.toISODate(),
      max: today
        .plus({
          year: 2
        })
        .toISODate(),
      default: today
        .plus({
          year: 1
        })
        .toISODate()
    }
  }, [])
}
