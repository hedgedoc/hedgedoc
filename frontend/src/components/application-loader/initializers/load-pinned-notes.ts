/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { loadPinnedNotes } from '../../../redux/pinned-notes/methods'
import { Logger } from '../../../utils/logger'

const logger = new Logger('PinnedNotesInitializer')

/**
 * Loads the pinned notes from the backend.
 * Fails silently if the user is not logged in or there's an error.
 */
export const loadPinnedNotesInitializer = async (): Promise<void> => {
  try {
    await loadPinnedNotes()
  } catch (error) {
    logger.info('Could not load pinned notes.', error)
  }
}
