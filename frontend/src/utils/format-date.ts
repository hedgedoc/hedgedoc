/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DateTime } from 'luxon'

/**
 * Creates a format for the changedAt timestamp
 *
 *
 * @param changedAt the date as an ISO String or DateTime
 */
export const formatChangedAt = (changedAt: string | DateTime): string => {
  if (typeof changedAt === 'string') {
    changedAt = DateTime.fromISO(changedAt)
  }
  return changedAt.toRelative()
}
