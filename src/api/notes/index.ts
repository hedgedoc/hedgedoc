/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defaultFetchConfig, expectResponseCode, getApiUrl } from '../utils'

interface LastChange {
  userId: string
  timestamp: number
}

export interface Note {
  id: string
  alias: string
  lastChange: LastChange
  viewcount: number
  createtime: number
  content: string
  authorship: number[]
  preVersionTwoNote: boolean
}

export const getNote = async (noteId: string): Promise<Note> => {
  const response = await fetch(getApiUrl() + `/notes/${noteId}`, {
    ...defaultFetchConfig
  })
  expectResponseCode(response)
  return await response.json() as Promise<Note>
}

export const deleteNote = async (noteId: string): Promise<void> => {
  const response = await fetch(getApiUrl() + `/notes/${noteId}`, {
    ...defaultFetchConfig,
    method: 'DELETE'
  })
  expectResponseCode(response)
}
