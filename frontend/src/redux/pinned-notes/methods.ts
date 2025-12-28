/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '..'
import { pinnedNotesActionsCreator } from './slice'
import { getPinnedNotes, setPinnedState } from '../../api/explore'
import { Logger } from '../../utils/logger'

const logger = new Logger('PinnedNotesMethods')

/**
 * Loads the pinned notes from the backend and sets them in the redux store.
 */
export const loadPinnedNotes = async (): Promise<void> => {
  try {
    const pinnedNotes = await getPinnedNotes()
    const action = pinnedNotesActionsCreator.setPinnedNotes(pinnedNotes)
    store.dispatch(action)
  } catch (error) {
    logger.error('Failed to load pinned notes', error)
    throw error
  }
}

/**
 * Pins a note both in the backend and in the redux store.
 *
 * @param primaryAlias The primary alias of the note to pin
 */
export const pinNote = async (primaryAlias: string): Promise<void> => {
  try {
    const entry = await setPinnedState(primaryAlias, true)
    if (!entry) {
      throw new Error('Backend could not find pinned note')
    }
    const action = pinnedNotesActionsCreator.addPinnedNote(entry)
    store.dispatch(action)
  } catch (error) {
    logger.error('Failed to pin note', error)
    throw error
  }
}

/**
 * Unpins a note both in the backend and in the redux store.
 *
 * @param primaryAlias The primary alias of the note to unpin
 */
export const unpinNote = async (primaryAlias: string): Promise<void> => {
  try {
    await setPinnedState(primaryAlias, false)
    const action = pinnedNotesActionsCreator.removePinnedNote(primaryAlias)
    store.dispatch(action)
  } catch (error) {
    logger.error('Failed to unpin note', error)
    throw error
  }
}

/**
 * Sets the pin status of a note both in the backend and in the redux store.
 *
 * @param primaryAlias The primary alias of the note to pin or unpin
 * @param isPinned Whether the note should be pinned or unpinned
 */
export const setNotePinStatus = async (primaryAlias: string, isPinned: boolean): Promise<void> => {
  if (isPinned) {
    await pinNote(primaryAlias)
  } else {
    await unpinNote(primaryAlias)
  }
}
