/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { NotInDBError } from '../../../errors/errors';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { NotePermissionsUpdateDto } from '../../../notes/note-permissions.dto';
import { NotesService } from '../../../notes/notes.service';
import { RevisionsService } from '../../../revisions/revisions.service';
import { MarkdownBody } from '../../utils/markdownbody-decorator';

@Controller('notes')
export class NotesController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NotesService,
    private revisionsService: RevisionsService,
  ) {
    this.logger.setContext(NotesController.name);
  }

  @Post()
  async createNote(@MarkdownBody() text: string) {
    this.logger.debug('Got raw markdown:\n' + text);
    return this.noteService.createNoteDto(text);
  }

  @Get(':noteIdOrAlias')
  async getNote(@Param('noteIdOrAlias') noteIdOrAlias: string) {
    try {
      return await this.noteService.getNoteDtoByIdOrAlias(noteIdOrAlias);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Post(':noteAlias')
  async createNamedNote(
    @Param('noteAlias') noteAlias: string,
    @MarkdownBody() text: string,
  ) {
    this.logger.debug('Got raw markdown:\n' + text);
    return this.noteService.createNoteDto(text, noteAlias);
  }

  @Delete(':noteIdOrAlias')
  async deleteNote(@Param('noteIdOrAlias') noteIdOrAlias: string) {
    this.logger.debug('Deleting note: ' + noteIdOrAlias);
    try {
      await this.noteService.deleteNoteByIdOrAlias(noteIdOrAlias);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
    this.logger.debug('Successfully deleted ' + noteIdOrAlias);
    return;
  }

  @Put(':noteIdOrAlias')
  async updateNote(
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @MarkdownBody() text: string,
  ) {
    this.logger.debug('Got raw markdown:\n' + text);
    try {
      return await this.noteService.updateNoteByIdOrAlias(noteIdOrAlias, text);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Get(':noteIdOrAlias/content')
  @Header('content-type', 'text/markdown')
  async getNoteContent(@Param('noteIdOrAlias') noteIdOrAlias: string) {
    try {
      return await this.noteService.getNoteContent(noteIdOrAlias);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Get(':noteIdOrAlias/metadata')
  async getNoteMetadata(@Param('noteIdOrAlias') noteIdOrAlias: string) {
    try {
      return await this.noteService.getNoteMetadata(noteIdOrAlias);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Put(':noteIdOrAlias/permissions')
  async updateNotePermissions(
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Body() updateDto: NotePermissionsUpdateDto,
  ) {
    try {
      return await this.noteService.updateNotePermissions(
        noteIdOrAlias,
        updateDto,
      );
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Get(':noteIdOrAlias/revisions')
  async getNoteRevisions(@Param('noteIdOrAlias') noteIdOrAlias: string) {
    try {
      return await this.revisionsService.getNoteRevisionMetadatas(
        noteIdOrAlias,
      );
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Get(':noteIdOrAlias/revisions/:revisionId')
  async getNoteRevision(
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Param('revisionId') revisionId: number,
  ) {
    try {
      return await this.revisionsService.getNoteRevision(
        noteIdOrAlias,
        revisionId,
      );
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }
}
