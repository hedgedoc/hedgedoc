/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Create an array with numbers from 1 to n.
 *
 * @param length The length of the array (or the number n)
 * @return An array of numbers from 1 to n
 */
export const createNumberRangeArray = (length: number): number[] => {
  return Array.from(Array(length).keys())
}
