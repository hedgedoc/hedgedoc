/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { Note } from '../../notes/note.entity';
import { NotesService } from '../../notes/notes.service';

/**
 * This guard take the note's id in header and find the Note in database.
 */
@Injectable()
export class NoteHeaderGuard implements CanActivate {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NotesService,
  ) {
    this.logger.setContext(NoteHeaderGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request & {
      headers: { 'hedgedoc-note': string }; // eslint-disable-line
      note: Note;
    } = context.switchToHttp().getRequest();
    const noteId: string = request.headers['hedgedoc-note'];
    request.note = await this.noteService.getNoteByIdOrAlias(noteId);
    return true;
  }
}
