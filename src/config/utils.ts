/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const toArrayConfig = (configValue: string, separator = ',') => {
  if (!configValue || !configValue.includes(separator)) {
    return []
  }
  return (configValue.split(separator).map(arrayItem => arrayItem.trim()))
}
