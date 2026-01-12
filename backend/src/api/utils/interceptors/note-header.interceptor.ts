/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

import { NoteService } from '../../../notes/note.service';
import { CompleteRequest } from '../request.type';

/**
 * Saves the note identified by the `HedgeDoc-Note` header
 * under the `note` property of the request object.
 */
@Injectable()
export class NoteHeaderInterceptor implements NestInterceptor {
  constructor(private noteService: NoteService) {}

  async intercept<T>(context: ExecutionContext, next: CallHandler): Promise<Observable<T>> {
    const request: CompleteRequest = context.switchToHttp().getRequest();
    const noteId: string = request.headers['hedgedoc-note'] as string;
    request.noteId = await this.noteService.getNoteIdByAlias(noteId);
    return next.handle();
  }
}
