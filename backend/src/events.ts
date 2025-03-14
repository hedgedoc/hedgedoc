/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { EventMap } from 'eventemitter2';

export const eventModuleConfig = {
  wildcard: false,
  delimiter: '.',
  newListener: false,
  removeListener: false,
  maxListeners: 10,
  verboseMemoryLeak: true,
  ignoreErrors: false,
};

export enum NoteEvent {
  /**
   * Event triggered when a note's permissions are changed.
   * Payload:
   *  noteId: The id of the {@link Note}, for which permissions are changed.
   */
  PERMISSION_CHANGE = 'note.permission_change',

  /**
   * Event triggered when a note is deleted
   * Payload:
   *   noteId: The id of the {@link Note}, which is being deleted.
   */
  DELETION = 'note.deletion',
}

export interface NoteEventMap extends EventMap {
  [NoteEvent.PERMISSION_CHANGE]: (noteId: number) => void;
}
