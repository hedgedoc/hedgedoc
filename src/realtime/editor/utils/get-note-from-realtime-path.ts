/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Note } from '../../../notes/note.entity';
import { NotesService } from '../../../notes/notes.service';

const REALTIME_PATH_REGEX = /^\/realtime\/\?noteId=(.+)$/;

export async function getNoteFromRealtimePath(
  noteService: NotesService,
  realtimePath: string,
): Promise<Note> {
  const pathMatching = REALTIME_PATH_REGEX.exec(realtimePath);
  if (!pathMatching || pathMatching.length < 2) {
    throw new Error(
      'Realtime connection denied (invalid URL path): ' + realtimePath,
    );
  }
  const noteIdFromPath = pathMatching[1];
  return await noteService.getNoteByIdOrAlias(noteIdFromPath);
}
