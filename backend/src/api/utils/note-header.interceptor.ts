/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
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

/**
 * Saves the note identified by the `HedgeDoc-Note` header
 * under the `note` property of the request object.
 */
@Injectable()
export class NoteHeaderInterceptor implements NestInterceptor {
  constructor(private noteService: NotesService) {}

  async intercept<T>(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<T>> {
    const request: Request & {
      note: Note;
    } = context.switchToHttp().getRequest();
    const noteId: string = request.headers['hedgedoc-note'] as string;
    request.note = await this.noteService.getNoteByIdOrAlias(noteId);
    return next.handle();
  }
}
