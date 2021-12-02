/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface AccessToken {
  label: string
  validUntil: string
  keyId: string
  createdAt: string
  lastUsed: string
}

export interface AccessTokenWithSecret extends AccessToken {
  secret: string
}
