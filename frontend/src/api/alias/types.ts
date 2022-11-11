/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export interface Alias {
  name: string
  primaryAlias: boolean
  noteId: string
}

export interface NewAliasDto {
  noteIdOrAlias: string
  newAlias: string
}

export interface PrimaryAliasDto {
  primaryAlias: boolean
}
