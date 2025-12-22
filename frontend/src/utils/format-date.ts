/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DateTime } from 'luxon'

/**
 * Formats a timestamp form a DateTime or ISO string as relative to the user's current time.
 *
 * @param changedAt the date as an ISO String or DateTime
 * @return The formatted relative timestamp
 */
export const formatChangedAt = (changedAt: string | DateTime): string => {
  if (typeof changedAt === 'string') {
    changedAt = DateTime.fromISO(changedAt)
  }
  return changedAt.toRelative()
}
