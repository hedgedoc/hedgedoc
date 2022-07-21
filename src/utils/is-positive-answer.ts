/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Checks if the given string is a positive answer (yes, true or 1).
 *
 * @param value The value to check
 */
export const isPositiveAnswer = (value: string) => {
  const lowerValue = value.toLowerCase()
  return lowerValue === 'yes' || lowerValue === '1' || lowerValue === 'true'
}
