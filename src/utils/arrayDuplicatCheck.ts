/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function checkArrayForDuplicates<T>(array: Array<T>): boolean {
  return new Set(array).size !== array.length;
}
