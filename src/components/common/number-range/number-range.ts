/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const createNumberRangeArray = (length: number): number[] => {
  return Array.from(Array(length)
    .keys())
}
