/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isArray } from 'class-validator';

import { Note } from '../../notes/note.entity';
import { NotesService } from '../../notes/notes.service';
import { CompleteRequest } from './request.type';

export async function extractNoteFromRequest(
  request: CompleteRequest,
  noteService: NotesService,
): Promise<Note | undefined> {
  const noteIdOrAlias = extractNoteIdOrAlias(request);
  if (noteIdOrAlias === undefined) {
    return undefined;
  }
  return await noteService.getNoteByIdOrAlias(noteIdOrAlias);
}

function extractNoteIdOrAlias(request: CompleteRequest): string | undefined {
  const noteIdOrAlias =
    request.params['noteIdOrAlias'] || request.headers['hedgedoc-note'];
  if (noteIdOrAlias === undefined) {
    return undefined;
  } else if (isArray(noteIdOrAlias)) {
    return noteIdOrAlias[0];
  } else {
    return noteIdOrAlias;
  }
}
