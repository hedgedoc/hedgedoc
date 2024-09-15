/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export enum HistoryEntryOrigin {
  LOCAL = 'local',
  REMOTE = 'remote'
}

export interface HistoryEntryPutDto {
  note: string
  pinStatus: boolean
  lastVisitedAt: string
}

export interface HistoryEntry {
  identifier: string
  title: string
  owner: string | null
  lastVisitedAt: string
  tags: string[]
  pinStatus: boolean
}

export interface HistoryEntryWithOrigin extends HistoryEntry {
  origin: HistoryEntryOrigin
}

export interface ChangePinStatusDto {
  pinStatus: boolean
}
