/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';

import { ForbiddenIdError, NotInDBError } from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { Note } from '../../notes/note.entity';
import { NotesService } from '../../notes/notes.service';

@Injectable()
export class GetNotePipe implements PipeTransform<string, Promise<Note>> {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NotesService,
  ) {
    this.logger.setContext(GetNotePipe.name);
  }

  async transform(noteIdOrAlias: string, _: ArgumentMetadata): Promise<Note> {
    return await getNote(this.noteService, noteIdOrAlias);
  }
}

export async function getNote(
  noteService: NotesService,
  noteIdOrAlias: string,
): Promise<Note> {
  let note: Note;
  try {
    note = await noteService.getNoteByIdOrAlias(noteIdOrAlias);
  } catch (e) {
    if (e instanceof NotInDBError) {
      throw new NotFoundException(e.message);
    }
    if (e instanceof ForbiddenIdError) {
      throw new BadRequestException(e.message);
    }
    throw e;
  }
  return note;
}
