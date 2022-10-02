/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { Note } from '../../notes/note.entity';
import { NotesService } from '../../notes/notes.service';
import { User } from '../../users/user.entity';

/**
 * Saves the note identified by the `noteIdOrAlias` URL parameter
 * under the `note` property of the request object.
 */
@Injectable()
export class GetNoteInterceptor implements NestInterceptor {
  constructor(private noteService: NotesService) {}

  async intercept<T>(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<T>> {
    const request: Request & { user: User; note: Note } = context
      .switchToHttp()
      .getRequest();
    const noteIdOrAlias = request.params['noteIdOrAlias'];
    request.note = await getNote(this.noteService, noteIdOrAlias);
    return next.handle();
  }
}

export async function getNote(
  noteService: NotesService,
  noteIdOrAlias: string,
): Promise<Note> {
  return await noteService.getNoteByIdOrAlias(noteIdOrAlias);
}
