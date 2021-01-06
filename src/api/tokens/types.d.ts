/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
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
