/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface HistoryEntryPutDto {
  note: string
  pinStatus: boolean
  lastVisited: string
}

export interface HistoryEntryUpdateDto {
  pinStatus: boolean
}

export interface HistoryEntryDto {
  identifier: string
  title: string
  lastVisited: string
  tags: string[]
  pinStatus: boolean
}
