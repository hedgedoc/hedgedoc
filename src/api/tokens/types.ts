/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface AccessToken {
  label: string
  validUntil: string
  keyId: string
  createdAt: string
  lastUsedAt: string | null
}

export interface AccessTokenWithSecret extends AccessToken {
  secret: string
}

export interface CreateAccessTokenDto {
  label: string
  validUntil: number
}
