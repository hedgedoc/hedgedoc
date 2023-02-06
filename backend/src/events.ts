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
  PERMISSION_CHANGE = 'note.permission_change' /** noteId: The id of the [@link Note], which permissions are changed. **/,
  DELETION = 'note.deletion' /** noteId: The id of the [@link Note], which is being deleted. **/,
}

export interface NoteEventMap extends EventMap {
  [NoteEvent.PERMISSION_CHANGE]: (noteId: number) => void;
}
