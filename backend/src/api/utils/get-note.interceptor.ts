/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { NoteService } from '../../notes/note.service';
import { extractNoteFromRequest } from './extract-note-from-request';
import { CompleteRequest } from './request.type';

/**
 * Saves the note identified by the `noteIdOrAlias` URL parameter
 * under the `note` property of the request object.
 */
@Injectable()
export class GetNoteInterceptor implements NestInterceptor {
  constructor(private noteService: NoteService) {}

  async intercept<T>(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<T>> {
    const request: CompleteRequest = context.switchToHttp().getRequest();
    const noteId = await extractNoteFromRequest(request, this.noteService);
    if (noteId !== undefined) {
      request.noteId = noteId;
    }
    return next.handle();
  }
}
