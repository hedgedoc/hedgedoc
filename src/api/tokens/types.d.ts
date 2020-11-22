/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface AccessToken {
  label: string
  created: number
}

export interface AccessTokenSecret {
  secret: string
}
