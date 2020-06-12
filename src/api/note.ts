import { expectResponseCode, getBackendUrl } from '../utils/apiUtils'
import { defaultFetchConfig } from './default'

interface LastChange {
  userId: string
  username: string
  timestamp: number
}

export interface Note {
  id: string
  alias: string
  lastChange: LastChange
  viewcount: number
  createtime: string
  content: string
  authorship: number[]
  preVersionTwoNote: boolean
}

export const getNote = async (noteId: string): Promise<Note> => {
  const response = await fetch(getBackendUrl() + `/notes/${noteId}`)
  expectResponseCode(response)
  return await response.json() as Promise<Note>
}

export const deleteNote = async (noteId: string): Promise<void> => {
  const response = await fetch(getBackendUrl() + `/notes/${noteId}`, {
    ...defaultFetchConfig,
    method: 'DELETE'
  })
  expectResponseCode(response)
}
