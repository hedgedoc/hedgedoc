/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isArray } from 'class-validator';

import { FieldNameNote, Note } from '../../database/types';
import { NoteService } from '../../notes/note.service';
import { CompleteRequest } from './request.type';

export async function extractNoteFromRequest(
  request: CompleteRequest,
  noteService: NoteService,
): Promise<Note[FieldNameNote.id] | undefined> {
  const alias = extractNoteAlias(request);
  if (alias === undefined) {
    return undefined;
  }
  return await noteService.getNoteIdByAlias(alias);
}

function extractNoteAlias(request: CompleteRequest): string | undefined {
  const noteAlias =
    request.params['noteAlias'] || request.headers['hedgedoc-note'];
  if (isArray(noteAlias)) {
    return noteAlias[0];
  }
  return noteAlias;
}
