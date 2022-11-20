/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export enum AccessLevel {
  NONE,
  READ_ONLY,
  WRITEABLE
}

export enum SpecialGroup {
  EVERYONE = '_EVERYONE',
  LOGGED_IN = '_LOGGED_IN'
}
